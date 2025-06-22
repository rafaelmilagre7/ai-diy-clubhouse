
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

export const useOnboardingRequired = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingRequirement = async () => {
      if (authLoading || !user) {
        setIsLoading(true);
        return;
      }

      try {
        console.log('[ONBOARDING-REQUIRED] Verificando necessidade de onboarding para:', user.id);
        
        // Verificar se onboarding foi completado
        const onboardingCompleted = profile?.onboarding_completed === true;
        
        console.log('[ONBOARDING-REQUIRED] Status do onboarding:', {
          userId: user.id,
          email: user.email,
          profileOnboardingCompleted: profile?.onboarding_completed,
          onboardingCompleted,
          userRole: getUserRoleName(profile)
        });

        // Se onboarding foi completado, não é necessário
        if (onboardingCompleted) {
          console.log('[ONBOARDING-REQUIRED] Onboarding não necessário - já completado');
          setIsRequired(false);
          setHasCompleted(true);
        } else {
          console.log('[ONBOARDING-REQUIRED] Onboarding OBRIGATÓRIO - não completado');
          setIsRequired(true);
          setHasCompleted(false);
        }
        
      } catch (error) {
        console.error('[ONBOARDING-REQUIRED] Erro ao verificar necessidade de onboarding:', error);
        // SEGURANÇA: Em caso de erro, assumir que precisa fazer onboarding
        setIsRequired(true);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingRequirement();
  }, [user, profile, authLoading]);

  console.log('[ONBOARDING-REQUIRED] Estado final:', {
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
