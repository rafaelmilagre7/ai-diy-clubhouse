
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';

interface SmartFeatureAccessResult {
  hasAccess: boolean;
  hasRoleAccess: boolean;
  setupComplete: boolean;
  blockReason: 'insufficient_role' | 'incomplete_setup' | 'feature_disabled' | 'none';
  isLoading: boolean;
}

export const useSmartFeatureAccess = (feature: string) => {
  const { profile, user } = useAuth();

  return useQuery({
    queryKey: ['smart-feature-access', feature, user?.id, profile?.role],
    queryFn: async (): Promise<SmartFeatureAccessResult> => {
      // Verificar se a feature existe na configuração
      if (!(feature in APP_FEATURES)) {
        return {
          hasAccess: false,
          hasRoleAccess: false,
          setupComplete: false,
          blockReason: 'feature_disabled',
          isLoading: false
        };
      }

      // Verificar se a feature está habilitada globalmente
      const featureConfig = APP_FEATURES[feature];
      if (!featureConfig?.enabled) {
        return {
          hasAccess: false,
          hasRoleAccess: profile?.role === 'admin',
          setupComplete: true,
          blockReason: 'feature_disabled',
          isLoading: false
        };
      }

      // Verificar acesso baseado no papel do usuário
      const hasRoleAccess = isFeatureEnabledForUser(feature, profile?.role);
      
      return {
        hasAccess: hasRoleAccess,
        hasRoleAccess,
        setupComplete: true,
        blockReason: hasRoleAccess ? 'none' : 'insufficient_role',
        isLoading: false
      };
    },
    enabled: !!user && !!profile,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
