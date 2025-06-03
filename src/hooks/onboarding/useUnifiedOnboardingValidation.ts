
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useCallback } from 'react';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['unified-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 useUnifiedOnboardingValidation: Nenhum usuário encontrado');
        return {
          isCompleted: false,
          hasData: false,
          source: 'no_user'
        };
      }

      try {
        console.log('🔍 useUnifiedOnboardingValidation: Verificando onboarding para usuário:', user.id);
        
        // Verificar primeiro na tabela quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed, name, email, current_step')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          console.log('✅ useUnifiedOnboardingValidation: Quick onboarding encontrado:', quickData);
          return {
            isCompleted: quickData.is_completed || false,
            hasData: true,
            source: 'quick_onboarding',
            data: quickData
          };
        }

        // Fallback para onboarding_progress
        const { data: progressData, error: progressError } = await supabase
          .from('onboarding_progress')
          .select('is_completed, current_step')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressData && !progressError) {
          console.log('✅ useUnifiedOnboardingValidation: Onboarding progress encontrado:', progressData);
          return {
            isCompleted: progressData.is_completed || false,
            hasData: true,
            source: 'onboarding_progress',
            data: progressData
          };
        }

        // Se não encontrou dados em nenhuma tabela
        console.log('⚠️ useUnifiedOnboardingValidation: Nenhum dado de onboarding encontrado');
        return {
          isCompleted: false,
          hasData: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ useUnifiedOnboardingValidation: Erro ao verificar conclusão do onboarding:', error);
        return {
          isCompleted: false,
          hasData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    retry: 2,
    retryDelay: 1000
  });

  // Função para invalidar e recarregar os dados
  const checkOnboardingStatus = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['unified-onboarding-validation', user?.id]
    });
  }, [queryClient, user?.id]);

  return {
    isOnboardingComplete: data?.isCompleted || false,
    hasValidData: data?.hasData || false,
    isLoading,
    error,
    source: data?.source || 'none',
    onboardingData: data?.data || null,
    checkOnboardingStatus
  };
};
