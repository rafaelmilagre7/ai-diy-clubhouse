
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Busca o perfil do usuário de forma segura com tratamento de erros
 */
export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    logger.info(`[AUTH-SESSION] Buscando perfil para usuário: ${userId.substring(0, 8)}***`);
    
    const { data, error } = await supabase
      .from('profiles') // CORREÇÃO: Usar 'profiles' ao invés de 'user_profiles'
      .select(`
        id,
        email,
        name,
        role_id,
        avatar_url,
        company_name,
        industry,
        created_at,
        onboarding_completed,
        onboarding_completed_at,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('[AUTH-SESSION] Erro ao buscar perfil:', error);
      return null;
    }
    
    if (!data) {
      logger.warn(`[AUTH-SESSION] Nenhum perfil encontrado para o usuário ${userId.substring(0, 8)}***`);
      return null;
    }
    
    logger.info('[AUTH-SESSION] Perfil encontrado com sucesso');
    return data as UserProfile;
    
  } catch (error) {
    logger.error('[AUTH-SESSION] Erro inesperado ao buscar perfil:', error);
    return null;
  }
};

/**
 * Cria um perfil de usuário se não existir
 */
export const createUserProfileSecurely = async (
  userId: string, 
  email: string, 
  name?: string
): Promise<UserProfile | null> => {
  try {
    logger.info(`[AUTH-SESSION] Criando perfil para usuário: ${email}`);
    
    // Buscar role_id padrão para membro_club
    const { data: defaultRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club')
      .single();
    
    const defaultRoleId = defaultRole?.id || null;
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles') // CORREÇÃO: Usar 'profiles' ao invés de 'user_profiles'
      .upsert({
        id: userId,
        email,
        name: name || 'Usuário',
        role_id: defaultRoleId,
        created_at: new Date().toISOString(),
        avatar_url: null,
        company_name: null,
        industry: null,
        onboarding_completed: false,
        onboarding_completed_at: null
      })
      .select(`
        id,
        email,
        name,
        role_id,
        avatar_url,
        company_name,
        industry,
        created_at,
        onboarding_completed,
        onboarding_completed_at,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .single();
      
    if (insertError) {
      logger.error('[AUTH-SESSION] Erro ao criar perfil:', insertError);
      return null;
    }
    
    logger.info('[AUTH-SESSION] Perfil criado com sucesso');
    return newProfile as UserProfile;
    
  } catch (error) {
    logger.error('[AUTH-SESSION] Erro inesperado ao criar perfil:', error);
    return null;
  }
};
