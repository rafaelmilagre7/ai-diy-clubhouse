
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

export interface FeatureAccessResult {
  hasAccess: boolean;
  hasRoleAccess: boolean;
  onboardingComplete: boolean;
  userRole: string | null;
  feature: string;
  blockReason: 'insufficient_role' | 'incomplete_onboarding' | 'none';
}

export function useSmartFeatureAccess(feature: string) {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['smart-feature-access', user?.id, feature],
    queryFn: async (): Promise<FeatureAccessResult> => {
      if (!user?.id || !profile) {
        return {
          hasAccess: false,
          hasRoleAccess: false,
          onboardingComplete: false,
          userRole: null,
          feature,
          blockReason: 'insufficient_role'
        };
      }

      // Verificação direta baseada apenas no papel do usuário
      const userRole = profile.role || 'member';
      const hasRoleAccess = ['admin', 'member', 'membro_club'].includes(userRole);
      
      // Para agora, consideramos que usuários com papel válido têm acesso completo
      // Removemos completamente a dependência de onboarding
      const hasAccess = hasRoleAccess;
      const onboardingComplete = true; // Sempre true, sem verificação de onboarding
      
      return {
        hasAccess,
        hasRoleAccess,
        onboardingComplete,
        userRole,
        feature,
        blockReason: hasAccess ? 'none' : 'insufficient_role'
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });
}
