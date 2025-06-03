
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface SimpleOnboardingValidation {
  isOnboardingComplete: boolean;
  isLoading: boolean;
  hasValidData: boolean;
  checkOnboardingStatus: () => Promise<void>;
}

export const useSimpleOnboardingValidation = (): SimpleOnboardingValidation => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidData, setHasValidData] = useState(false);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) {
      setIsOnboardingComplete(false);
      setIsLoading(false);
      setHasValidData(true);
      return;
    }

    try {
      setIsLoading(true);

      // Verificar se existe progresso de onboarding
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Erro ao verificar progresso:', progressError);
        setIsOnboardingComplete(false);
        setHasValidData(true);
        return;
      }

      // Se existe progresso e está completo
      if (progressData?.is_completed) {
        setIsOnboardingComplete(true);
      } else {
        setIsOnboardingComplete(false);
      }

      setHasValidData(true);
    } catch (error) {
      console.error('Erro ao validar onboarding:', error);
      setIsOnboardingComplete(false);
      setHasValidData(true);
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
    hasValidData,
    checkOnboardingStatus
  };
};
