
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useSimpleOnboardingValidation = () => {
  const { user } = useAuth();

  const { data: completionData, isLoading } = useQuery({
    queryKey: ['onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isCompleted: false, source: 'no_user' };

      try {
        // Primeiro verificar na tabela quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          console.log('✅ Dados encontrados na quick_onboarding:', quickData);
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
          console.log('✅ Dados encontrados na onboarding_progress:', progressData);
          return {
            isCompleted: progressData.is_completed || false,
            source: 'onboarding_progress'
          };
        }

        // Se não encontrou dados em nenhuma tabela, consideramos incompleto
        console.log('⚠️ Nenhum dado de onboarding encontrado - considerando incompleto');
        return {
          isCompleted: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ Erro ao verificar onboarding:', error);
        return {
          isCompleted: false,
          source: 'error'
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
  });

  const validateOnboardingCompletion = async (): Promise<boolean> => {
    if (isLoading) return false;
    const result = completionData?.isCompleted || false;
    console.log('🔍 Validação de onboarding:', result, 'fonte:', completionData?.source);
    return result;
  };

  return {
    validateOnboardingCompletion,
    isOnboardingComplete: completionData?.isCompleted || false,
    hasValidData: !isLoading,
    isLoading,
    source: completionData?.source
  };
};
