
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

      // Verificar quick_onboarding primeiro
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

      // Se não encontrou, assumir incompleto
      console.log('📊 Onboarding incompleto');
      setIsOnboardingComplete(false);

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
