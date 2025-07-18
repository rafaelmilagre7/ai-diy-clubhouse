
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase";
import { logger } from "@/utils/logger";

// Cache local simples para evitar requests desnecessários
const profileCache = new Map<string, { profile: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('🔍 [FETCH-PROFILE-DEBUG] fetchUserProfile iniciado', { userId });
  logger.info('[PROFILE] 🔄 Buscando perfil via função de cache segura', { userId });
  
  try {
    // LIMPAR CACHE CORROMPIDO
    profileCache.clear();
    console.log('🧹 [FETCH-PROFILE-DEBUG] Cache local limpo');
    logger.info('[PROFILE] 🧹 Cache local limpo');

    console.log('📞 [FETCH-PROFILE-DEBUG] Chamando get_cached_profile RPC...');
    // USAR APENAS A FUNÇÃO DE CACHE OTIMIZADA - NÃO ACESSAR TABELAS DIRETAMENTE
    const { data: cacheData, error: cacheError } = await supabase.rpc('get_cached_profile', {
      target_user_id: userId
    });
    
    console.log('📋 [FETCH-PROFILE-DEBUG] RPC response:', { 
      hasData: !!cacheData, 
      error: cacheError,
      dataKeys: cacheData ? Object.keys(cacheData) : []
    });

    if (cacheError) {
      console.error('❌ [FETCH-PROFILE-DEBUG] Erro na função de cache:', cacheError);
      logger.error('[PROFILE] Erro na função de cache', { userId, error: cacheError });
      throw new Error(`RPC get_cached_profile falhou: ${cacheError.message}`);
    }

    if (!cacheData) {
      console.log('⚠️ [FETCH-PROFILE-DEBUG] Nenhum dado retornado pela função de cache');
      logger.warn('[PROFILE] Perfil não encontrado', { userId });
      return null;
    }

    const profile = cacheData as UserProfile;
    
    console.log('✅ [FETCH-PROFILE-DEBUG] Perfil encontrado via cache:', {
      name: profile.name,
      email: profile.email,
      hasRole: !!profile.user_roles,
      roleName: profile.user_roles?.name,
      onboardingCompleted: profile.onboarding_completed
    });
    
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
    console.error('💥 [FETCH-PROFILE-DEBUG] Erro inesperado no fetchUserProfile:', error);
    logger.error('[PROFILE] Erro inesperado ao buscar perfil', { userId, error });
    
    // 🎯 FALLBACK DIRETO: Se RPC falhar, tentar query direta como último recurso
    try {
      console.log('🆘 [FETCH-PROFILE-DEBUG] Tentando fallback com query direta...');
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            permissions
          )
        `)
        .eq('id', userId)
        .maybeSingle();
        
      if (directError) {
        console.error('❌ [FETCH-PROFILE-DEBUG] Fallback direto também falhou:', directError);
        throw directError;
      }
      
      if (directData) {
        console.log('🆘✅ [FETCH-PROFILE-DEBUG] Fallback direto funcionou!', { name: directData.name });
        return directData as UserProfile;
      }
      
      console.log('🆘⚠️ [FETCH-PROFILE-DEBUG] Fallback direto não encontrou perfil');
      return null;
      
    } catch (fallbackError) {
      console.error('💥 [FETCH-PROFILE-DEBUG] Fallback direto também falhou:', fallbackError);
      throw error; // Relançar o erro original
    }
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
