
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';

export const useFeatureAccess = () => {
  const { profile } = useAuth();
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
