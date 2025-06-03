
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) {
      setIsOnboardingComplete(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Verificando status do onboarding para usuário:', user.id);

      // Verificar PRIMEIRO na tabela onboarding_final
      const { data: finalData, error: finalError } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .maybeSingle();

      if (finalData && !finalError) {
        console.log('✅ Onboarding final COMPLETO');
        setIsOnboardingComplete(true);
        setIsLoading(false);
        return;
      }

      // Verificar na tabela onboarding como fallback
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboardingData && !onboardingError) {
        const isCompleted = onboardingData.is_completed === true;
        console.log('✅ Onboarding status:', isCompleted);
        setIsOnboardingComplete(isCompleted);
      } else {
        // Se não encontrou dados, assumir incompleto
        console.log('📊 Onboarding incompleto - nenhum registro encontrado');
        setIsOnboardingComplete(false);
      }

    } catch (error) {
      console.error('❌ Erro ao verificar onboarding:', error);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    isOnboardingComplete,
    isLoading,
    checkOnboardingStatus
  };
};
