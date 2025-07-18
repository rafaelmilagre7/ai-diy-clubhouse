
import { supabase } from '@/lib/supabase';

/**
 * Validates user role based on their role_id in the database
 */
export const validateUserRole = async (userId: string): Promise<string> => {
  try {
    // Usar timeout para evitar travamentos
    const fetchPromise = supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('id', userId)
      .maybeSingle(); // Usar maybeSingle para evitar erros se não encontrar

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout validating role')), 5000)
    );

    const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Erro ao validar papel do usuário:', error);
      return 'member'; // Default fallback
    }

    if (!profile) {
      console.warn('Perfil não encontrado para usuário:', userId);
      return 'member';
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
    // Usar timeout para evitar travamentos
    const fetchPromise = supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('id', userId)
      .maybeSingle(); // Usar maybeSingle para evitar erros se não encontrar

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout checking admin')), 5000)
    );

    const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error || !profile) {
      console.error('Erro ao verificar super admin:', error);
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
