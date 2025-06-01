
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useCallback } from 'react';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 useUnifiedOnboardingValidation: Nenhum usuário encontrado');
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'no_user'
        };
      }

      try {
        console.log('🔍 useUnifiedOnboardingValidation: Verificando onboarding para usuário:', user.id);
        
        // Verificar PRIMEIRO na tabela onboarding_final (nova prioridade)
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed, completed_at, id')
          .eq('user_id', user.id)
          .eq('is_completed', true) // APENAS registros realmente completos
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ useUnifiedOnboardingValidation: Onboarding final COMPLETO encontrado:', finalData);
          return {
            isOnboardingComplete: true,
            hasValidData: true,
            source: 'onboarding_final',
            completedAt: finalData.completed_at,
            onboardingId: finalData.id
          };
        }

        console.log('🔍 useUnifiedOnboardingValidation: Verificando na tabela quick_onboarding...');
        
        // Verificar na tabela quick_onboarding como fallback
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed, current_step, id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          console.log('✅ useUnifiedOnboardingValidation: Dados do quick_onboarding encontrados:', quickData);
          const isCompleted = quickData.is_completed === true;
          
          return {
            isOnboardingComplete: isCompleted,
            hasValidData: true,
            source: 'quick_onboarding',
            currentStep: quickData.current_step,
            onboardingId: quickData.id
          };
        }

        // Se não encontrou dados em nenhuma tabela
        console.log('⚠️ useUnifiedOnboardingValidation: Nenhum dado de onboarding encontrado - usuário deve começar do zero');
        return {
          isOnboardingComplete: false,
          hasValidData: true,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ useUnifiedOnboardingValidation: Erro ao verificar conclusão do onboarding:', error);
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 1000, // Reduzido para 10 segundos para detectar mudanças mais rápido
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1
  });

  // Função para invalidar cache e forçar revalidação
  const invalidateOnboardingCache = useCallback(() => {
    console.log('🔄 Invalidando cache de onboarding...');
    queryClient.invalidateQueries({ queryKey: ['unified-onboarding-validation'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-completion'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-completion-check'] });
    queryClient.removeQueries({ queryKey: ['unified-onboarding-validation'] });
  }, [queryClient]);

  // Função para revalidar dados
  const revalidateOnboarding = useCallback(() => {
    console.log('🔄 Revalidando dados de onboarding...');
    invalidateOnboardingCache();
    return refetch();
  }, [invalidateOnboardingCache, refetch]);

  const result = {
    isOnboardingComplete: data?.isOnboardingComplete || false,
    hasValidData: data?.hasValidData || false,
    isLoading,
    error,
    source: data?.source,
    invalidateOnboardingCache,
    revalidateOnboarding
  };

  console.log('🎯 useUnifiedOnboardingValidation result:', result);

  return result;
};
