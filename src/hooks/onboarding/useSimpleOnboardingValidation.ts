
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useSimpleOnboardingValidation = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [hasValidData, setHasValidData] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) {
        setHasValidData(true);
        setIsOnboardingComplete(false);
        return;
      }

      try {
        // Verificar quick_onboarding primeiro
        const { data: quickData } = await supabase
          .from('quick_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData) {
          setIsOnboardingComplete(quickData.is_completed || false);
          setHasValidData(true);
          return;
        }

        // Fallback para onboarding_progress
        const { data: progressData } = await supabase
          .from('onboarding_progress')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressData) {
          setIsOnboardingComplete(progressData.is_completed || false);
        } else {
          setIsOnboardingComplete(false);
        }

        setHasValidData(true);
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        setIsOnboardingComplete(false);
        setHasValidData(true);
      }
    };

    checkOnboardingStatus();
  }, [user?.id]);

  return {
    isOnboardingComplete,
    hasValidData
  };
};
