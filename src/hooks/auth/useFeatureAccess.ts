
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';
import { usePermissionListener } from './usePermissionListener';

export const useFeatureAccess = () => {
  const { profile } = useAuth();
  const userRole = getUserRoleName(profile);
  const userPermissions = profile?.user_roles?.permissions || {};

  // 🔄 Detectar mudanças de permissões em tempo real
  usePermissionListener();

  const hasFeatureAccess = (featureName: string) => {
    return isFeatureEnabledForUser(featureName, userRole, userPermissions);
  };

  return {
    hasFeatureAccess,
    isAdmin: userRole === 'admin',
    userRole,
    userPermissions
  };
};
