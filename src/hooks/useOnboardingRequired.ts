
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';

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
        logger.info('[ONBOARDING-REQUIRED] Verificando necessidade de onboarding:', {
          userId: user.id.substring(0, 8) + '***',
          email: user.email,
          hasProfile: !!profile
        });
        
        // Se não há perfil, aguardar um pouco mais
        if (!profile) {
          logger.warn('[ONBOARDING-REQUIRED] Aguardando carregamento do perfil...');
          setTimeout(() => {
            setIsLoading(false);
          }, 2000);
          return;
        }
        
        // Verificar se onboarding foi completado
        const onboardingCompleted = profile?.onboarding_completed === true;
        
        logger.info('[ONBOARDING-REQUIRED] Status do onboarding:', {
          userId: user.id.substring(0, 8) + '***',
          onboardingCompleted,
          userRole: getUserRoleName(profile)
        });

        // Administradores podem pular onboarding
        if (getUserRoleName(profile) === 'admin') {
          logger.info('[ONBOARDING-REQUIRED] Admin detectado - onboarding opcional');
          setIsRequired(false);
          setHasCompleted(true);
        } else if (onboardingCompleted) {
          logger.info('[ONBOARDING-REQUIRED] Onboarding já completado');
          setIsRequired(false);
          setHasCompleted(true);
        } else {
          logger.info('[ONBOARDING-REQUIRED] Onboarding OBRIGATÓRIO');
          setIsRequired(true);
          setHasCompleted(false);
        }
        
      } catch (error) {
        logger.error('[ONBOARDING-REQUIRED] Erro ao verificar onboarding:', error);
        // SEGURANÇA: Em caso de erro, assumir que precisa fazer onboarding
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
