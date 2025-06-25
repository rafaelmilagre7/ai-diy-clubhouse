
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';

export const useSimpleOnboarding = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Só verificar quando auth não estiver carregando
    if (authLoading || !user) {
      return;
    }

    logger.info('Verificando onboarding:', {
      userId: user.id.substring(0, 8) + '***',
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed
    });

    // Se não há perfil após 1 segundo, assumir que não precisa onboarding
    if (!profile) {
      const timer = setTimeout(() => {
        logger.warn('Perfil não carregado, assumindo onboarding não necessário');
        setIsRequired(false);
        setHasCompleted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }

    // Verificar se onboarding foi completado
    const onboardingCompleted = profile.onboarding_completed === true;
    const userRole = getUserRoleName(profile);

    // Admins podem pular onboarding
    if (userRole === 'admin') {
      setIsRequired(false);
      setHasCompleted(true);
    } else {
      setIsRequired(!onboardingCompleted);
      setHasCompleted(onboardingCompleted);
    }

  }, [user, profile, authLoading]);

  return {
    isRequired,
    hasCompleted,
    isLoading: authLoading
  };
};
