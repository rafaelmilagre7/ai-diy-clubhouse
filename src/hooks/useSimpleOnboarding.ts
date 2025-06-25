
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';

export const useSimpleOnboarding = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);

  useEffect(() => {
    // Se auth ainda está carregando, aguardar
    if (authLoading || !user) {
      setIsLoading(true);
      return;
    }

    // Timeout de 2s para aguardar perfil
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Se tem perfil, verificar onboarding
    if (profile) {
      clearTimeout(timeout);
      
      const userRole = getUserRoleName(profile);
      const onboardingCompleted = profile?.onboarding_completed === true;
      
      // Admin não precisa de onboarding
      if (userRole === 'admin') {
        setIsRequired(false);
      } else {
        setIsRequired(!onboardingCompleted);
      }
      
      setIsLoading(false);
      
      logger.info('[SIMPLE-ONBOARDING] Verificação concluída:', {
        userRole,
        onboardingCompleted,
        isRequired: !onboardingCompleted && userRole !== 'admin'
      });
    }

    return () => clearTimeout(timeout);
  }, [user, profile, authLoading]);

  return {
    isRequired,
    isLoading
  };
};
