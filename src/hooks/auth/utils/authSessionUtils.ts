import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { authCacheManager, debounceManager } from './authCacheManager';

// Re-exportar o debounceManager para que outros arquivos possam usá-lo
export { debounceManager } from './authCacheManager';

/**
 * Valida a sessão do usuário de forma segura com retry
 */
export const validateUserSession = async (retries: number = 2) => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      logger.debug(`[AUTH-SESSION] Tentativa ${attempt}/${retries + 1} de validação`);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        if (attempt === retries + 1) {
          logger.error('[AUTH-SESSION] Erro final na validação', { error });
          return { session: null, user: null };
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      return { 
        session, 
        user: session?.user || null 
      };
    } catch (error) {
      if (attempt === retries + 1) {
        logger.error('[AUTH-SESSION] Erro crítico na validação', { error });
        return { session: null, user: null };
      }
      
      // Aguardar com backoff exponencial
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  
  return { session: null, user: null };
};

/**
 * Busca o perfil do usuário com cache otimizado
 */
export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Verificar cache primeiro
    const cached = authCacheManager.get(userId);
    if (cached !== undefined) {
      return cached;
    }

    // Usar debounce para evitar múltiplas chamadas simultâneas
    const result = await debounceManager.execute(
      `fetch-profile-${userId}`,
      async () => {
        logger.info('[PROFILE-FETCH] Buscando perfil usando função segura');
        
        // Tentar função segura primeiro
        const { data: profiles, error } = await supabase
          .rpc('get_user_profile_safe', { user_id: userId });
        
        if (!error && profiles?.[0]) {
          const profile = profiles[0] as UserProfile;
          
          // Buscar role se necessário
          if (!profile.user_roles && profile.role_id) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('id, name, description, permissions')
              .eq('id', profile.role_id)
              .single();
            
            if (roleData) {
              profile.user_roles = roleData;
            }
          }
          
          // Cache o resultado
          authCacheManager.set(userId, profile);
          return profile;
        }
        
        // Fallback ROBUSTO para query direta se função RPC falhar
        logger.warn('[PROFILE-FETCH] Função segura falhou, usando fallback direto');
        
        try {
          const { data: directData, error: directError } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles:role_id (
                id,
                name,
                description,
                permissions
              )
            `)
            .eq('id', userId)
            .single();
          
          if (directError) {
            logger.error('[PROFILE-FETCH] Erro no fallback direto:', directError);
            return null;
          }
          
          if (directData) {
            // Cache o resultado do fallback
            authCacheManager.set(userId, directData as UserProfile);
            logger.info('[PROFILE-FETCH] ✅ Perfil carregado via fallback direto');
            return directData as UserProfile;
          }
        } catch (fallbackError) {
          logger.error('[PROFILE-FETCH] Erro crítico no fallback:', fallbackError);
        }
        
        // Se tudo falhar, retornar null
        return null;
      },
      300 // 300ms debounce
    );

    return result;
    
  } catch (error) {
    logger.error('[PROFILE-FETCH] Erro crítico', { error });
    authCacheManager.set(userId, null);
    return null;
  }
};

/**
 * Processa e valida o perfil do usuário com cache
 */
export const processUserProfile = async (
  userId: string,
  userEmail?: string,
  userName?: string
): Promise<UserProfile | null> => {
  try {
    let profile = await fetchUserProfileSecurely(userId);
    
    // Se não há perfil, criar um básico
    if (!profile && userEmail) {
      logger.info('[PROFILE-PROCESS] Criando perfil básico para usuário');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          user_roles (
            id,
            name,
            description,
            permissions
          )
        `)
        .single();
      
      if (createError) {
        logger.error('[PROFILE-PROCESS] Erro ao criar perfil', { error: createError });
        return null;
      }
      
      profile = newProfile as UserProfile;
      
      // Invalidar cache e definir novo perfil
      authCacheManager.invalidate(userId);
      authCacheManager.set(userId, profile);
    }
    
    return profile;
    
  } catch (error) {
    logger.error('[PROFILE-PROCESS] Erro no processamento', { error });
    return null;
  }
};

/**
 * Limpa o cache de perfil
 */
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    authCacheManager.invalidate(userId);
  } else {
    authCacheManager.clear();
  }
  debounceManager.clear();
};

/**
 * Invalidar cache quando perfil é atualizado
 */
export const invalidateProfileCache = (userId: string) => {
  authCacheManager.invalidate(userId);
  logger.info('[PROFILE-CACHE] Cache invalidado após atualização');
};

/**
 * Obter estatísticas do cache para debug
 */
export const getCacheStats = () => {
  return authCacheManager.getStats();
};
