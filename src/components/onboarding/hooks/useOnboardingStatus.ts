
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';

export const useOnboardingStatus = () => {
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading || !user) {
        setIsLoading(true);
        return;
      }

      try {
        console.log('[OnboardingStatus] Verificando status para usuário:', user.id);
        
        // MUDANÇA: Usar profiles.onboarding_completed como fonte principal
        const onboardingCompleted = profile?.onboarding_completed === true;

        console.log('[OnboardingStatus] Status:', {
          userId: user.id,
          email: user.email,
          profileOnboardingCompleted: profile?.onboarding_completed,
          onboardingCompleted,
          userRole: profile?.user_roles?.name
        });

        // TODOS devem fazer onboarding se não completaram
        setHasCompleted(onboardingCompleted);
        setIsRequired(!onboardingCompleted);
        
      } catch (error) {
        console.error('[OnboardingStatus] Erro ao verificar status do onboarding:', error);
        // Em caso de erro, assumir que precisa fazer onboarding por segurança
        setIsRequired(true);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, profile, authLoading]);

  console.log('[OnboardingStatus] Estado atual:', {
    isLoading,
    isRequired,
    hasCompleted,
    userId: user?.id,
    profileOnboardingCompleted: profile?.onboarding_completed
  });

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
