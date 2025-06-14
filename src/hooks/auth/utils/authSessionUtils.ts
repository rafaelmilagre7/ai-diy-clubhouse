
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// Cache para perfis de usuário
const profileCache = new Map<string, { profile: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const clearProfileCache = () => {
  profileCache.clear();
};

/**
 * Valida a sessão do usuário de forma segura
 */
export const validateUserSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('[AUTH-SESSION] Erro ao validar sessão:', error);
      return { session: null, user: null };
    }
    
    return { 
      session, 
      user: session?.user || null 
    };
  } catch (error) {
    logger.error('[AUTH-SESSION] Erro crítico na validação:', error);
    return { session: null, user: null };
  }
};

/**
 * Busca o perfil do usuário usando a nova função segura (compatível com jsonb único)
 */
export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Verificar cache primeiro
    const cached = profileCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      logger.debug('[PROFILE-FETCH] Retornando perfil do cache');
      return cached.profile;
    }

    logger.info('[PROFILE-FETCH] Buscando perfil usando função segura');

    // Função agora retorna um JSON único
    const { data, error } = await supabase
      .rpc('get_user_profile_safe', { p_user_id: userId });

    if (error) {
      logger.error('[PROFILE-FETCH] Erro na função segura:', error);
      return null;
    }

    // Interpreta o retorno corretamente
    let profile: UserProfile | null = null;
    if (Array.isArray(data) && data.length > 0) {
      profile = data[0] as UserProfile;
    } else if (data && typeof data === 'object') {
      profile = data as UserProfile;
    } else {
      profile = null;
    }

    if (profile) {
      logger.info('[PROFILE-FETCH] Perfil carregado com sucesso:', {
        userId: profile.id?.substring(0, 8) + '***',
        hasRole: !!profile.user_roles,
        roleName: profile.user_roles?.name || 'sem role'
      });
    }

    // Cache o resultado
    profileCache.set(userId, { profile, timestamp: Date.now() });
    return profile;
  } catch (error) {
    logger.error('[PROFILE-FETCH] Erro crítico:', error);
    return null;
  }
};

/**
 * Processa e valida o perfil do usuário
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
        logger.error('[PROFILE-PROCESS] Erro ao criar perfil:', createError);
        return null;
      }
      
      profile = newProfile as UserProfile;
      
      // Limpar cache após criação
      profileCache.delete(userId);
    }
    
    return profile;
  } catch (error) {
    logger.error('[PROFILE-PROCESS] Erro no processamento:', error);
    return null;
  }
};
