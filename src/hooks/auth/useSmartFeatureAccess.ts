
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

interface SmartFeatureAccessResult {
  hasAccess: boolean;
  blockReason: 'insufficient_role' | 'incomplete_setup' | 'none';
  hasRoleAccess: boolean;
  setupComplete: boolean;
}

export const useSmartFeatureAccess = (feature: string) => {
  const { profile, user } = useAuth();

  return useQuery({
    queryKey: ['smart-feature-access', feature, user?.id, profile?.role],
    queryFn: async (): Promise<SmartFeatureAccessResult> => {
      // Verificação simplificada baseada apenas no papel do usuário
      const hasRoleAccess = profile?.role && ['admin', 'member', 'membro_club'].includes(profile.role);
      
      // Para a versão simplificada, setup sempre completo
      const setupComplete = true;
      
      // Lógica de acesso simplificada
      const hasAccess = hasRoleAccess && setupComplete;
      
      let blockReason: 'insufficient_role' | 'incomplete_setup' | 'none' = 'none';
      
      if (!hasRoleAccess) {
        blockReason = 'insufficient_role';
      } else if (!setupComplete) {
        blockReason = 'incomplete_setup';
      }

      return {
        hasAccess,
        blockReason,
        hasRoleAccess: hasRoleAccess || false,
        setupComplete
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
