
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useUnifiedOnboardingValidation = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Verificando status unificado do onboarding...');

      // Verificar quick_onboarding primeiro
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (quickError && quickError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar quick_onboarding:', quickError);
      }

      // Se quick_onboarding está completo, considerar como completo
      if (quickData?.is_completed) {
        console.log('✅ Quick onboarding completo');
        setIsOnboardingComplete(true);
        setIsLoading(false);
        return;
      }

      // Verificar onboarding_progress como fallback
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar onboarding_progress:', progressError);
      }

      const isCompleted = progressData?.is_completed || false;
      console.log(`📊 Status final do onboarding: ${isCompleted}`);
      setIsOnboardingComplete(isCompleted);

    } catch (error) {
      console.error('❌ Erro inesperado na validação:', error);
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
