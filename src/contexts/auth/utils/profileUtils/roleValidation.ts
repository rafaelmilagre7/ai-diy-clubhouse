
import { supabase } from '@/lib/supabase';

/**
 * Validates user role based on their role_id in the database
 */
export const validateUserRole = async (userId: string): Promise<string> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Erro ao validar papel do usuário:', error);
      return 'member'; // Default fallback
    }

    // Return the role name from the database via join
    if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
      const roleName = profile.user_roles.name;
      return typeof roleName === 'string' ? roleName : 'member';
    }

    return 'member';
  } catch (error) {
    console.error('Erro na validação de papel:', error);
    return 'member';
  }
};

/**
 * Checks if user is a super admin based on database role_id
 */
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return false;
    }

    // SEGURANÇA: Usar apenas user_roles table (sem fallback para role legacy)
    const userRoles = profile.user_roles as any;
    return (userRoles && userRoles.name === 'admin') ||
           (userRoles && userRoles.permissions && userRoles.permissions.all === true);
  } catch (error) {
    console.error('Erro ao verificar super admin:', error);
    return false;
  }
};
