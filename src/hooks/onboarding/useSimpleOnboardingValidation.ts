
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useSimpleOnboardingValidation = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['simple-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          isCompleted: false,
          hasData: false
        };
      }

      try {
        // Verificar quick_onboarding primeiro
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed, name, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          return {
            isCompleted: quickData.is_completed || false,
            hasData: true,
            userData: quickData
          };
        }

        return {
          isCompleted: false,
          hasData: false
        };
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        return {
          isCompleted: false,
          hasData: false,
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minuto
    retry: 1
  });

  return {
    isOnboardingComplete: data?.isCompleted || false,
    hasValidData: data?.hasData || false,
    userData: data?.userData || null,
    isLoading,
    error
  };
};
