
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

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
 * CORREÇÃO: Busca o perfil do usuário de forma simples e direta
 */
export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('[PROFILE-FETCH] Buscando perfil para:', userId.substring(0, 8) + '***');
    
    // Query simples e direta - sem JOINs complexos
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('[PROFILE-FETCH] Erro na query:', error);
      return null;
    }
    
    if (!profile) {
      console.log('[PROFILE-FETCH] Perfil não encontrado');
      return null;
    }

    // Buscar role separadamente se necessário
    let userRole = null;
    if (profile.role_id) {
      const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', profile.role_id)
        .single();
      
      userRole = role;
    }
    
    const fullProfile: UserProfile = {
      ...profile,
      user_roles: userRole
    };
    
    console.log('[PROFILE-FETCH] Perfil carregado:', {
      email: profile.email,
      role: userRole?.name || 'sem role'
    });
    
    return fullProfile;
    
  } catch (error) {
    console.error('[PROFILE-FETCH] Erro crítico:', error);
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
      console.log('[PROFILE-PROCESS] Criando perfil básico para usuário');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('[PROFILE-PROCESS] Erro ao criar perfil:', createError);
        return null;
      }
      
      profile = newProfile as UserProfile;
    }
    
    return profile;
    
  } catch (error) {
    console.error('[PROFILE-PROCESS] Erro no processamento:', error);
    return null;
  }
};

// Remover função de cache
export const clearProfileCache = () => {
  // Cache removido - não faz nada
};
