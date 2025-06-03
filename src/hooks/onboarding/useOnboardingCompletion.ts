
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingCompletion = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-completion', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Verificar primeiro na tabela quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          console.log('📊 quick_onboarding data:', quickData);
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
          .maybeSingle();

        if (progressData && !progressError) {
          console.log('📊 onboarding_progress data:', progressData);
          return {
            isCompleted: progressData.is_completed || false,
            source: 'onboarding_progress'
          };
        }

        console.log('📊 Nenhum dado encontrado - onboarding incompleto');
        return {
          isCompleted: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ Erro na query de completion:', error);
        return {
          isCompleted: false,
          source: 'error'
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnMount: true,
  });
};
