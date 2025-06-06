
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingCompletion = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-completion', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // TEMPORÁRIO: Sempre retorna como completo para desativar validações
      console.log('🔄 Onboarding validation disabled - always returning completed');
      return {
        isCompleted: true,
        source: 'disabled'
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });
};
