
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useOptimizedAuth } from '@/hooks/auth/useOptimizedAuth';
import { useCallback, useMemo } from 'react';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();
  const { isAdmin } = useOptimizedAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'no_user'
        };
      }

      // CORREÇÃO CRÍTICA: Para admins, sempre considerar onboarding completo
      if (isAdmin) {
        console.log('✅ useUnifiedOnboardingValidation: Admin detectado, considerando onboarding completo');
        return {
          isOnboardingComplete: true,
          hasValidData: true,
          source: 'admin_bypass'
        };
      }

      try {
        console.log('🔍 useUnifiedOnboardingValidation: Verificando onboarding para usuário:', user.id);

        // Verificar PRIMEIRO na tabela onboarding_final
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed, completed_at, id')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ Onboarding encontrado completo em onboarding_final:', finalData);
          return {
            isOnboardingComplete: true,
            hasValidData: true,
            source: 'onboarding_final',
            completedAt: finalData.completed_at,
            onboardingId: finalData.id
          };
        }

        // FALLBACK: Verificar na tabela quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed, current_step, id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          const isCompleted = quickData.is_completed === true;
          console.log('📊 Status do quick_onboarding:', { isCompleted, step: quickData.current_step });
          
          return {
            isOnboardingComplete: isCompleted,
            hasValidData: true,
            source: 'quick_onboarding',
            currentStep: quickData.current_step,
            onboardingId: quickData.id
          };
        }

        // CORREÇÃO CRÍTICA: Se não encontrou dados, para usuários normais pode ser que precisem fazer onboarding
        // Mas para evitar loops, não forçar redirecionamento aqui
        console.log('⚠️ Nenhum dado de onboarding encontrado - assumindo incompleto');
        return {
          isOnboardingComplete: false,
          hasValidData: true,
          source: 'no_data_found'
        };

      } catch (error) {
        console.error('❌ Erro ao verificar onboarding:', error);
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos para reduzir refetches
    refetchOnMount: false, // Não refetch automático
    refetchOnWindowFocus: false, // Não refetch no foco
    retry: 1
  });

  // Função para invalidar cache
  const invalidateOnboardingCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['unified-onboarding-validation'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-completion'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-completion-check'] });
  }, [queryClient]);

  // Função para revalidar dados
  const revalidateOnboarding = useCallback(() => {
    invalidateOnboardingCache();
    return refetch();
  }, [invalidateOnboardingCache, refetch]);

  const result = useMemo(() => ({
    isOnboardingComplete: data?.isOnboardingComplete || false,
    hasValidData: data?.hasValidData || false,
    isLoading,
    error,
    source: data?.source,
    invalidateOnboardingCache,
    revalidateOnboarding
  }), [data, isLoading, error, invalidateOnboardingCache, revalidateOnboarding]);

  console.log('📋 useUnifiedOnboardingValidation: Resultado final', result);

  return result;
};
