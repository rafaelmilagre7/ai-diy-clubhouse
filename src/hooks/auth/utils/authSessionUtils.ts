import { Session } from '@supabase/supabase-js';
import { 
  validateRole as validateUserRole,
  determineRoleFromEmail 
} from '@/contexts/auth/utils/profileUtils/roleValidation';

/**
 * Retrieves the user's role from the session, or determines it from the email if not present.
 */
export const getUserRole = (session: Session | null): string => {
  if (session?.user?.user_metadata?.role) {
    return session.user.user_metadata.role as string;
  }

  // Determine role from email if role is not in user metadata
  return determineRoleFromEmail(session?.user?.email || '');
};

/**
 * Validates if the user's role matches the required role.
 */
export const validateUserAuthorization = (session: Session | null, requiredRole: string | string[]): boolean => {
  const userRole = getUserRole(session);
  return validateUserRole(userRole, requiredRole);
};
