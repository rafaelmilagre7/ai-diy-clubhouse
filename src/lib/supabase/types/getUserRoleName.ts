
import { UserProfile } from '@/types/userProfile';

export const getUserRoleName = (profile: UserProfile | null | undefined): string | null => {
  if (!profile) return null;
  
  // Primeiro, tentar user_roles.name
  if (profile.user_roles?.name) {
    return profile.user_roles.name;
  }
  
  // Fallback para role diretamente
  if (profile.role) {
    return profile.role;
  }
  
  return null;
};
