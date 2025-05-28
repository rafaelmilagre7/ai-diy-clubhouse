
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingCompletion = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-completion', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Verificar primeiro na tabela quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('is_completed')
        .eq('user_id', user.id)
        .single();

      if (quickData && !quickError) {
        return {
          isCompleted: quickData.is_completed || false,
          source: 'quick_onboarding'
        };
      }

      // Fallback para onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .single();

      if (progressData && !progressError) {
        return {
          isCompleted: progressData.is_completed || false,
          source: 'onboarding_progress'
        };
      }

      return {
        isCompleted: false,
        source: 'none'
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
