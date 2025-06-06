
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser } from '@/config/features';

interface NetworkingAccessResult {
  hasAccess: boolean;
  reason?: string;
  isLoading: boolean;
}

export const useNetworkingAccess = (): NetworkingAccessResult => {
  const { profile, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['networking-access', user?.id, profile?.role],
    queryFn: async () => {
      // Verificação baseada na configuração central de features
      const hasAccess = isFeatureEnabledForUser('networking', profile?.role);
      
      let reason: string | undefined;
      if (!hasAccess) {
        if (!APP_FEATURES.networking.enabled) {
          reason = 'O sistema de networking está temporariamente indisponível';
        } else if (APP_FEATURES.networking.adminOnly && profile?.role !== 'admin') {
          reason = 'Acesso restrito a administradores';
        } else {
          reason = 'Acesso não autorizado';
        }
      }
      
      return {
        hasAccess,
        reason
      };
    },
    enabled: !!user && !!profile,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  return {
    hasAccess: data?.hasAccess || false,
    reason: data?.reason,
    isLoading
  };
};
