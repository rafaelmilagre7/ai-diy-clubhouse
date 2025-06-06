
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

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
      // Verificação simplificada: apenas admin e formação têm acesso
      const hasAccess = profile?.role === 'admin' || profile?.role === 'formacao';
      
      return {
        hasAccess,
        reason: hasAccess ? undefined : 'Acesso restrito a administradores e formação'
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
