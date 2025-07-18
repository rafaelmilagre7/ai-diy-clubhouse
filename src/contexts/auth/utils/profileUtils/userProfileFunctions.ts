
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase";
import { logger } from "@/utils/logger";

// Cache local simples para evitar requests desnecessários
const profileCache = new Map<string, { profile: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    logger.info('[PROFILE] 🔄 Buscando perfil via função de cache segura', { userId });
    
    // LIMPAR CACHE CORROMPIDO
    profileCache.clear();
    logger.info('[PROFILE] 🧹 Cache local limpo');

    // USAR APENAS A FUNÇÃO DE CACHE OTIMIZADA - NÃO ACESSAR TABELAS DIRETAMENTE
    const { data: cacheData, error: cacheError } = await supabase.rpc('get_cached_profile', {
      target_user_id: userId
    });

    if (cacheError) {
      logger.error('[PROFILE] Erro na função de cache', { userId, error: cacheError });
      return null;
    }

    if (!cacheData) {
      logger.warn('[PROFILE] Perfil não encontrado', { userId });
      return null;
    }

    const profile = cacheData as UserProfile;
    
    logger.info('[PROFILE] ✅ Perfil carregado com sucesso via cache', { 
      userId, 
      name: profile.name,
      hasUserRoles: !!profile.user_roles,
      roleName: profile.user_roles?.name
    });
    
    // Atualizar cache local
    profileCache.set(userId, { profile, timestamp: Date.now() });
    
    return profile;
  } catch (error) {
    logger.error('[PROFILE] Erro inesperado ao buscar perfil', { userId, error });
    return null;
  }
};

// Função para limpar cache quando necessário
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
    logger.info('[PROFILE] Cache limpo para usuário específico', { userId });
  } else {
    profileCache.clear();
    logger.info('[PROFILE] Cache completamente limpo');
  }
};

export const createUserProfileIfNeeded = async (
  userId: string,
  email?: string,
  name?: string
): Promise<UserProfile | null> => {
  try {
    console.log(`[PROFILE] Verificando se precisa criar perfil para: ${userId}`);
    
    // Primeiro verificar se já existe
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      console.log(`[PROFILE] Perfil já existe para: ${userId}`);
      return existingProfile;
    }

    console.log(`[PROFILE] Criando perfil para usuário: ${userId}`);
    
    // Usar a função segura do banco
    const { data, error } = await supabase.rpc('create_missing_profile_safe', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    if (data?.success) {
      console.log(`[PROFILE] Perfil criado com sucesso para: ${userId}`);
      // Buscar o perfil recém-criado
      return await fetchUserProfile(userId);
    }

    console.warn(`[PROFILE] Falha na criação do perfil: ${data?.message || 'Erro desconhecido'}`);
    return null;
  } catch (error) {
    console.error('Error in createUserProfileIfNeeded:', error);
    return null;
  }
};
