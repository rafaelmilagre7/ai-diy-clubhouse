
import { supabase } from '@/lib/supabase';

/**
 * Validates user role based on their actual role in the database
 * Removed hardcoded email validations for production
 */
export const validateUserRole = async (userId: string): Promise<string> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, role_id, user_roles(name)')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Erro ao validar papel do usuário:', error);
      return 'member'; // Default fallback
    }

    // Return the role from the database
    return profile.role || 'member';
  } catch (error) {
    console.error('Erro na validação de papel:', error);
    return 'member';
  }
};

/**
 * Checks if user is a super admin based on database role
 */
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, user_roles(name, permissions)')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return false;
    }

    // Check if user has admin role or admin permissions
    const userRoles = profile.user_roles as any;
    return profile.role === 'admin' || 
           (userRoles && userRoles.permissions && userRoles.permissions.all === true) ||
           (userRoles && userRoles.name === 'admin');
  } catch (error) {
    console.error('Erro ao verificar super admin:', error);
    return false;
  }
};
