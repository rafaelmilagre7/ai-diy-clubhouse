
import { supabase, UserProfile } from '@/lib/supabase';
import { getUserRoleName } from '@/lib/supabase/types';

/**
 * Fetch user profile from Supabase com join para user_roles
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`Buscando perfil para usuário: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
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
      // Handle infinite recursion policy error specially
      if (error.message.includes('infinite recursion')) {
        console.warn('Detectada recursão infinita na política. Tentando criar perfil como solução alternativa.');
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null; // Retornar null ao invés de lançar erro
    }
    
    if (!data) {
      console.warn(`Nenhum perfil encontrado para o usuário ${userId}`);
      return null;
    }
    
    // Mapear corretamente o resultado da query
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      name: data.name,
      role_id: data.role_id,
      avatar_url: data.avatar_url,
      company_name: data.company_name,
      industry: data.industry,
      created_at: data.created_at,
      onboarding_completed: data.onboarding_completed,
      onboarding_completed_at: data.onboarding_completed_at,
      user_roles: data.user_roles as any
    };
    
    console.log('Perfil encontrado:', profile);
    return profile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null; // Retornar null ao invés de lançar erro
  }
};

/**
 * Create profile for user if it doesn't exist
 */
export const createUserProfileIfNeeded = async (
  userId: string, 
  email: string, 
  name: string = 'Usuário'
): Promise<UserProfile | null> => {
  try {
    console.log(`Tentando criar perfil para ${email}`);
    
    // Buscar role_id padrão para membro_club
    const { data: defaultRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club')
      .single();
    
    const defaultRoleId = defaultRole?.id || null;
    
    // Use upsert with conflict handling to avoid duplications
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        name,
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
      // If insertion fails due to policies, try using fallback
      if (insertError.message.includes('policy') || insertError.message.includes('permission denied')) {
        console.warn('Erro de política ao criar perfil. Continuando com perfil alternativo:', insertError);
        return createFallbackProfile(userId, email, name, defaultRoleId);
      }
      
      console.error('Erro ao criar perfil:', insertError);
      return createFallbackProfile(userId, email, name, defaultRoleId);
    }
    
    // Mapear corretamente o resultado da query
    const profile: UserProfile = {
      id: newProfile.id,
      email: newProfile.email,
      name: newProfile.name,
      role_id: newProfile.role_id,
      avatar_url: newProfile.avatar_url,
      company_name: newProfile.company_name,
      industry: newProfile.industry,
      created_at: newProfile.created_at,
      onboarding_completed: newProfile.onboarding_completed,
      onboarding_completed_at: newProfile.onboarding_completed_at,
      user_roles: newProfile.user_roles as any
    };
    
    console.log('Perfil criado com sucesso:', profile);
    return profile;
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    // Return minimal profile in case of error to not block application
    return createFallbackProfile(userId, email, name, null);
  }
};

/**
 * Creates a minimal fallback profile when database operations fail
 */
const createFallbackProfile = (
  userId: string, 
  email: string, 
  name: string, 
  roleId: string | null
): UserProfile => {
  console.log(`Criando perfil alternativo para ${email}`);
  return {
    id: userId,
    email,
    name,
    role_id: roleId,
    user_roles: roleId ? { id: roleId, name: 'membro_club' } : null,
    avatar_url: null,
    company_name: null,
    industry: null,
    created_at: new Date().toISOString(),
    onboarding_completed: false,
    onboarding_completed_at: null
  };
};
