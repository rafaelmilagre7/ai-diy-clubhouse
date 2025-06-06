
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';

export const useFeatureAccess = () => {
  const { profile } = useAuth();

  const hasFeatureAccess = (featureName: keyof typeof APP_FEATURES) => {
    return isFeatureEnabledForUser(featureName, profile?.role);
  };

  return {
    hasFeatureAccess,
    isAdmin: profile?.role === 'admin',
    userRole: profile?.role
  };
};
