
import { UserProfile } from '../../types';

export const validateUserRole = (profile: UserProfile, allowedRoles: string[]): boolean => {
  if (!profile) return false;
  
  // Verificar via user_roles (novo sistema)
  if (profile.user_roles?.name) {
    return allowedRoles.includes(profile.user_roles.name);
  }
  
  // Verificar via role (sistema legado)
  if (profile.role?.name) {
    return allowedRoles.includes(profile.role.name);
  }
  
  return false;
};

export const isSuperAdmin = (profile: UserProfile): boolean => {
  if (!profile) return false;
  
  // Verificar via user_roles
  if (profile.user_roles?.name === 'super_admin') {
    return true;
  }
  
  // Verificar via role (legado)
  if (profile.role?.name === 'super_admin') {
    return true;
  }
  
  return false;
};
