
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

      // Verificar quick_onboarding primeiro (prioridade)
      const { data: quickData } = await supabase
        .from('quick_onboarding')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .maybeSingle();

      if (quickData) {
        console.log('✅ Quick onboarding completo');
        setIsOnboardingComplete(true);
        setIsLoading(false);
        return;
      }

      // Verificar onboarding_progress como fallback
      const { data: progressData } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .maybeSingle();

      const isCompleted = !!progressData;
      console.log(`📊 Status final do onboarding: ${isCompleted}`);
      
      setIsOnboardingComplete(isCompleted);

    } catch (error) {
      console.error('❌ Erro ao verificar onboarding:', error);
      // Em caso de erro, assumir que não está completo para segurança
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
