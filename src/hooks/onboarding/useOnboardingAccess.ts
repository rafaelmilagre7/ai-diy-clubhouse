
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingAccess = () => {
  const { user } = useAuth();

  const { data: accessData, isLoading } = useQuery({
    queryKey: ['onboarding-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hasAccess: false, isCompleted: false };

      try {
        // Verificar primeiro na tabela quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          console.log('🔓 Status de acesso via quick_onboarding:', quickData.is_completed);
          return {
            hasAccess: quickData.is_completed || false,
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
          console.log('🔓 Status de acesso via onboarding_progress:', progressData.is_completed);
          return {
            hasAccess: progressData.is_completed || false,
            isCompleted: progressData.is_completed || false,
            source: 'onboarding_progress'
          };
        }

        console.log('🔒 Nenhum onboarding encontrado - acesso negado');
        return {
          hasAccess: false,
          isCompleted: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ Erro ao verificar acesso:', error);
        return {
          hasAccess: false,
          isCompleted: false,
          source: 'error'
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    hasAccess: accessData?.hasAccess || false,
    isCompleted: accessData?.isCompleted || false,
    isLoading,
    source: accessData?.source
  };
};
