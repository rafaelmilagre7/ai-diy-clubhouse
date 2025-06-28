
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const useFeatureAccess = () => {
  const { user, isAdmin, isFormacao } = useSimpleAuth();

  const hasFeatureAccess = (feature: string) => {
    if (!user) return false;
    
    // Simple feature access logic
    switch (feature) {
      case 'admin_panel':
        return isAdmin;
      case 'content_creation':
        return isAdmin || isFormacao;
      case 'analytics':
        return isAdmin;
      case 'user_management':
        return isAdmin;
      default:
        return true; // Basic features available to all users
    }
  };

  return {
    hasFeatureAccess,
    canAccessAdminPanel: isAdmin,
    canCreateContent: isAdmin || isFormacao,
    canViewAnalytics: isAdmin,
    canManageUsers: isAdmin
  };
};
