
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['unified-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 useUnifiedOnboardingValidation: Nenhum usuário encontrado');
        return {
          isOnboardingComplete: false,
          hasData: false,
          source: 'no_user'
        };
      }

      try {
        console.log('🔍 useUnifiedOnboardingValidation: Verificando onboarding para usuário:', user.id);
        
        // Verificar na tabela onboarding_final
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed, completed_at, id')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ useUnifiedOnboardingValidation: Onboarding final encontrado como completo:', finalData);
          return {
            isOnboardingComplete: true,
            hasData: true,
            source: 'onboarding_final',
            completedAt: finalData.completed_at,
            onboardingId: finalData.id
          };
        }

        console.log('🔍 useUnifiedOnboardingValidation: Nenhum onboarding completo encontrado');
        return {
          isOnboardingComplete: false,
          hasData: true,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ useUnifiedOnboardingValidation: Erro ao verificar onboarding:', error);
        return {
          isOnboardingComplete: false,
          hasData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    retry: 2
  });

  return {
    isOnboardingComplete: data?.isOnboardingComplete || false,
    hasData: data?.hasData || false,
    source: data?.source,
    completedAt: data?.completedAt,
    onboardingId: data?.onboardingId,
    isLoading,
    error
  };
};
