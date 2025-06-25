
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
      // Se ainda está carregando auth, aguardar um pouco
      if (authLoading) {
        return;
      }

      // Se não há usuário, não precisa de onboarding
      if (!user) {
        setIsRequired(false);
        setHasCompleted(false);
        setIsLoading(false);
        return;
      }

      try {
        logger.info('[ONBOARDING-REQUIRED] Verificando necessidade de onboarding:', {
          userId: user.id.substring(0, 8) + '***',
          email: user.email,
          hasProfile: !!profile
        });
        
        // SIMPLIFICADO: Se não há perfil após 2 segundos, assumir que não precisa onboarding
        if (!profile) {
          logger.warn('[ONBOARDING-REQUIRED] Sem perfil - assumindo onboarding não necessário');
          setTimeout(() => {
            setIsRequired(false);
            setHasCompleted(true);
            setIsLoading(false);
          }, 2000);
          return;
        }
        
        // Verificar se onboarding foi completado
        const onboardingCompleted = profile?.onboarding_completed === true;
        const userRole = getUserRoleName(profile);
        
        logger.info('[ONBOARDING-REQUIRED] Status do onboarding:', {
          userId: user.id.substring(0, 8) + '***',
          onboardingCompleted,
          userRole
        });

        // Administradores podem pular onboarding
        if (userRole === 'admin') {
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
        // SEGURANÇA: Em caso de erro, assumir que não precisa onboarding para evitar loop
        setIsRequired(false);
        setHasCompleted(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Timeout de emergência - máximo 4 segundos
    const emergencyTimeout = setTimeout(() => {
      logger.warn('[ONBOARDING-REQUIRED] Timeout de emergência');
      setIsRequired(false);
      setHasCompleted(true);
      setIsLoading(false);
    }, 4000);

    checkOnboardingRequirement();

    return () => clearTimeout(emergencyTimeout);
  }, [user, profile, authLoading]);

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
