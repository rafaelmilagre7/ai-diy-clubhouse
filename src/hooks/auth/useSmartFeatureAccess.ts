
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';

interface SmartFeatureAccessResult {
  hasAccess: boolean;
  hasRoleAccess: boolean;
  setupComplete: boolean;
  blockReason: 'insufficient_role' | 'incomplete_setup' | 'feature_disabled' | 'none';
  isLoading: boolean;
}

/**
 * Hook para verificar acesso a features inteligentes
 * 
 * Nota: Trilha de implementação foi removida na Fase 4.
 * Este hook ainda funciona para outras features do sistema.
 */
export const useSmartFeatureAccess = (feature: string) => {
  const { profile, user } = useAuth();
  const userRole = getUserRoleName(profile);

  return useQuery({
    queryKey: ['smart-feature-access', feature, user?.id, userRole],
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
          hasRoleAccess: userRole === 'admin',
          setupComplete: true,
          blockReason: 'feature_disabled',
          isLoading: false
        };
      }

      // Verificar acesso baseado no papel do usuário
      const hasRoleAccess = isFeatureEnabledForUser(feature, userRole, profile?.user_roles?.permissions);
      
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
