
import { useQuery } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';

interface SmartFeatureAccessResult {
  hasAccess: boolean;
  hasRoleAccess: boolean;
  setupComplete: boolean;
  blockReason: 'insufficient_role' | 'incomplete_setup' | 'feature_disabled' | 'none';
  isLoading: boolean;
}

export const useSmartFeatureAccess = (feature: string) => {
  const { profile, user } = useSimpleAuth();
  const userRole = getUserRoleName(profile);

  return useQuery({
    queryKey: ['smart-feature-access', feature, user?.id, userRole],
    queryFn: async (): Promise<SmartFeatureAccessResult> => {
      if (!(feature in APP_FEATURES)) {
        return {
          hasAccess: false,
          hasRoleAccess: false,
          setupComplete: false,
          blockReason: 'feature_disabled',
          isLoading: false
        };
      }

      const featureConfig = APP_FEATURES[feature];
      if (!featureConfig?.enabled) {
        return {
          hasAccess: false,
          hasRoleAccess: userRole === 'admin',
          setupComplete: true,
          blockReason: 'feature_disabled',
          isLoading: false
        };
      }

      const hasRoleAccess = isFeatureEnabledForUser(feature, userRole);
      
      return {
        hasAccess: hasRoleAccess,
        hasRoleAccess,
        setupComplete: true,
        blockReason: hasRoleAccess ? 'none' : 'insufficient_role',
        isLoading: false
      };
    },
    enabled: !!user && !!profile,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
