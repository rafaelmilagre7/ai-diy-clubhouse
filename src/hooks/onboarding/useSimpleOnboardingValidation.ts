
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useCallback } from 'react';

export const useSimpleOnboardingValidation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['simple-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 useSimpleOnboardingValidation: Nenhum usuário encontrado');
        return {
          isOnboardingComplete: false,
          hasValidData: false
        };
      }

      try {
        console.log('🔍 useSimpleOnboardingValidation: Verificando onboarding para usuário:', user.id);
        
        // Verificar PRIMEIRO na tabela onboarding_final
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed')
          .eq('user_id', user.id)
          .eq('is_completed', true) // APENAS registros realmente completos
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ useSimpleOnboardingValidation: Onboarding final COMPLETO');
          return {
            isOnboardingComplete: true,
            hasValidData: true
          };
        }

        // Verificar na tabela quick_onboarding como fallback
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          const isCompleted = quickData.is_completed === true;
          console.log('✅ useSimpleOnboardingValidation: quick_onboarding status:', isCompleted);
          
          return {
            isOnboardingComplete: isCompleted,
            hasValidData: true
          };
        }

        // Se não encontrou dados, onboarding deve ser iniciado
        console.log('⚠️ useSimpleOnboardingValidation: Nenhum dado encontrado - onboarding deve ser iniciado');
        return {
          isOnboardingComplete: false,
          hasValidData: true
        };
      } catch (error) {
        console.error('❌ useSimpleOnboardingValidation: Erro:', error);
        return {
          isOnboardingComplete: false,
          hasValidData: false
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 1000, // Reduzido para detectar mudanças mais rápido
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1
  });

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    console.log('🔄 Invalidando cache simples de onboarding...');
    queryClient.invalidateQueries({ queryKey: ['simple-onboarding-validation'] });
    queryClient.removeQueries({ queryKey: ['simple-onboarding-validation'] });
  }, [queryClient]);

  return {
    isOnboardingComplete: data?.isOnboardingComplete || false,
    hasValidData: data?.hasValidData || false,
    isLoading,
    error,
    invalidateCache,
    refetch
  };
};
