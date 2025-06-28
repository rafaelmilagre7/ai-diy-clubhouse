
import { UserProfile } from './index';

/**
 * Get the role name from a user profile
 */
export function getUserRoleName(profile: UserProfile): string {
  if (!profile) return '';
  
  // Check if user_roles exists and has a name property
  if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
    return (profile.user_roles as any).name || '';
  }
  
  // Fallback to role field if it exists
  if (profile.role) {
    return profile.role;
  }
  
  return '';
}
