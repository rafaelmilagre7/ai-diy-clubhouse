
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';

export const useFeatureAccess = () => {
  const { profile } = useSimpleAuth();
  const userRole = getUserRoleName(profile);

  const hasFeatureAccess = (featureName: string) => {
    return isFeatureEnabledForUser(featureName, userRole);
  };

  return {
    hasFeatureAccess,
    isAdmin: userRole === 'admin',
    userRole
  };
};
