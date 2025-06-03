
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export interface FeatureAccessResult {
  hasAccess: boolean;
  hasRoleAccess: boolean;
  onboardingComplete: boolean;
  userRole: string | null;
  feature: string;
  blockReason: 'insufficient_role' | 'incomplete_onboarding' | 'none';
}

export function useSmartFeatureAccess(feature: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['smart-feature-access', user?.id, feature],
    queryFn: async (): Promise<FeatureAccessResult> => {
      if (!user?.id) {
        return {
          hasAccess: false,
          hasRoleAccess: false,
          onboardingComplete: false,
          userRole: null,
          feature,
          blockReason: 'insufficient_role'
        };
      }

      const { data, error } = await supabase.rpc('user_can_access_feature', {
        p_user_id: user.id,
        p_feature: feature
      });

      if (error) {
        console.error('Erro ao verificar acesso à funcionalidade:', error);
        return {
          hasAccess: false,
          hasRoleAccess: false,
          onboardingComplete: false,
          userRole: null,
          feature,
          blockReason: 'insufficient_role'
        };
      }

      return {
        hasAccess: data.has_access,
        hasRoleAccess: data.has_role_access,
        onboardingComplete: data.onboarding_complete,
        userRole: data.user_role,
        feature: data.feature,
        blockReason: data.block_reason
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnMount: true,
  });
}
