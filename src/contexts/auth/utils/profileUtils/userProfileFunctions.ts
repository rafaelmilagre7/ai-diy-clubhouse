
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase";
import { logger } from "@/utils/logger";

// Cache local simples para evitar requests desnecessários
const profileCache = new Map<string, { profile: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    logger.info('[PROFILE] 🔄 FORÇA RELOAD - Iniciando busca de perfil', { userId });
    
    // LIMPAR CACHE CORROMPIDO - ignorar cache local por enquanto
    profileCache.clear();
    logger.info('[PROFILE] 🧹 Cache local limpo - forçando dados frescos');

    // Tentar buscar do cache do banco primeiro
    const { data: cacheData } = await supabase.rpc('get_cached_profile', {
      target_user_id: userId
    });

    if (cacheData) {
      logger.info('[PROFILE] Perfil encontrado no cache do banco (CORRIGIDO)', { 
        userId, 
        cacheStructure: typeof cacheData,
        hasUserRoles: !!(cacheData as any)?.user_roles,
        roleName: (cacheData as any)?.user_roles?.name 
      });
      
      const profile = cacheData as UserProfile;
      
      // Verificar estrutura dos dados
      if (profile.user_roles?.name) {
        logger.info('[PROFILE] ✅ Estrutura correta com user_roles', { 
          roleName: profile.user_roles.name,
          name: profile.name 
        });
        // Atualizar cache local
        profileCache.set(userId, { profile, timestamp: Date.now() });
        return profile;
      } else {
        logger.warn('[PROFILE] ⚠️ Ainda sem user_roles, forçando busca direta', { 
          userId, 
          roleId: profile.role_id 
        });
      }
    }

    // Fallback: busca direta se cache falhar
    logger.info('[PROFILE] Cache miss, buscando perfil diretamente', { userId });
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles!role_id (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      logger.error('[PROFILE] Erro ao buscar perfil', { userId, error });
      return null;
    }

    if (!profile) {
      logger.warn('[PROFILE] Perfil não encontrado', { userId });
      profileCache.set(userId, { profile: null, timestamp: Date.now() });
      return null;
    }

    logger.info('[PROFILE] Perfil carregado com sucesso', { 
      userId, 
      profileId: profile.id,
      roleId: profile.role_id,
      hasUserRoles: !!profile.user_roles,
      roleName: profile.user_roles?.name,
      profileStructure: {
        hasRoleId: !!profile.role_id,
        hasUserRoles: !!profile.user_roles,
        userRolesType: typeof profile.user_roles
      }
    });
    
    // Atualizar cache local
    profileCache.set(userId, { profile: profile as UserProfile, timestamp: Date.now() });
    
    return profile as UserProfile;
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
