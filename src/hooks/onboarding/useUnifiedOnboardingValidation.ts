
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useCallback, useMemo } from 'react';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();
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

      try {
        // Verificar PRIMEIRO na tabela onboarding_final (nova prioridade)
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed, completed_at, id')
          .eq('user_id', user.id)
          .eq('is_completed', true) // APENAS registros realmente completos
          .maybeSingle();

        if (finalData && !finalError) {
          return {
            isOnboardingComplete: true,
            hasValidData: true,
            source: 'onboarding_final',
            completedAt: finalData.completed_at,
            onboardingId: finalData.id
          };
        }

        // Verificar na tabela quick_onboarding como fallback
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('is_completed, current_step, id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickError) {
          const isCompleted = quickData.is_completed === true;
          
          return {
            isOnboardingComplete: isCompleted,
            hasValidData: true,
            source: 'quick_onboarding',
            currentStep: quickData.current_step,
            onboardingId: quickData.id
          };
        }

        // Se não encontrou dados em nenhuma tabela, criar um registro inicial
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email, company_name, role')
          .eq('id', user.id)
          .single();

        // Criar registro inicial no quick_onboarding
        const { data: newRecord, error: insertError } = await supabase
          .from('quick_onboarding')
          .insert({
            user_id: user.id,
            is_completed: false,
            current_step: 1,
            name: profileData?.name || '',
            email: profileData?.email || '',
            whatsapp: '',
            country_code: '+55',
            how_found_us: '',
            company_name: profileData?.company_name || '',
            role: profileData?.role || 'member',
            company_size: '',
            company_segment: '',
            annual_revenue_range: '',
            main_challenge: '',
            ai_knowledge_level: 'iniciante',
            expected_outcome_30days: '',
            primary_goal: '',
            business_model: '',
            uses_ai: false,
            main_goal: ''
          })
          .select()
          .single();

        if (insertError) {
          return {
            isOnboardingComplete: false,
            hasValidData: false,
            source: 'error',
            error: insertError
          };
        }

        return {
          isOnboardingComplete: false,
          hasValidData: true,
          source: 'quick_onboarding_new',
          currentStep: 1,
          onboardingId: newRecord.id
        };
      } catch (error) {
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 1000, // 10 segundos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1
  });

  // Função para invalidar cache e forçar revalidação
  const invalidateOnboardingCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['unified-onboarding-validation'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-completion'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-completion-check'] });
    queryClient.removeQueries({ queryKey: ['unified-onboarding-validation'] });
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

  return result;
};
