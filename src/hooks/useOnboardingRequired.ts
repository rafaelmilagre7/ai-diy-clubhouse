
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { logger } from '@/utils/logger';

export const useOnboardingRequired = () => {
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
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
        logger.info('[ONBOARDING-REQUIRED] Verificação simplificada:', {
          userId: user.id.substring(0, 8) + '***',
          email: user.email,
          hasProfile: !!profile
        });
        
        // MUDANÇA CRÍTICA: Admin nunca precisa de onboarding
        const userRole = profile?.user_roles?.name;
        if (userRole === 'admin') {
          logger.info('[ONBOARDING-REQUIRED] Admin detectado - dispensando onboarding');
          setIsRequired(false);
          setHasCompleted(true);
          setIsLoading(false);
          return;
        }
        
        // Se não há perfil, aguardar máximo 1 segundo
        if (!profile) {
          logger.warn('[ONBOARDING-REQUIRED] Aguardando perfil por 1s...');
          setTimeout(() => {
            if (!profile) {
              logger.warn('[ONBOARDING-REQUIRED] Timeout - assumindo onboarding necessário');
              setIsRequired(true);
              setHasCompleted(false);
              setIsLoading(false);
            }
          }, 1000);
          return;
        }
        
        // Para outros usuários, verificar se completaram
        const onboardingCompleted = profile?.onboarding_completed === true;
        
        logger.info('[ONBOARDING-REQUIRED] Status para usuário não-admin:', {
          userId: user.id.substring(0, 8) + '***',
          onboardingCompleted,
          userRole
        });

        setIsRequired(!onboardingCompleted);
        setHasCompleted(onboardingCompleted);
        
      } catch (error) {
        logger.error('[ONBOARDING-REQUIRED] Erro - assumindo onboarding necessário:', error);
        setIsRequired(true);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingRequirement();
  }, [user, profile, authLoading]);

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
