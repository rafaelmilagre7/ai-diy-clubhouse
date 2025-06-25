
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
        logger.info('[ONBOARDING-REQUIRED] Verificação OBRIGATÓRIA para TODOS os usuários:', {
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
        
        // REGRA CRÍTICA: Verificar se onboarding foi completado (SEM EXCEÇÕES)
        const onboardingCompleted = profile?.onboarding_completed === true;
        
        logger.info('[ONBOARDING-REQUIRED] Status do onboarding (SEM EXCEÇÕES):', {
          userId: user.id.substring(0, 8) + '***',
          onboardingCompleted,
          profileOnboardingField: profile.onboarding_completed,
          userRole: profile?.user_roles?.name || 'unknown'
        });

        // MUDANÇA CRÍTICA: REMOVER TODA EXCEÇÃO PARA ADMIN
        // TODOS os usuários devem completar onboarding, sem exceção
        if (onboardingCompleted) {
          logger.info('[ONBOARDING-REQUIRED] Onboarding já completado');
          setIsRequired(false);
          setHasCompleted(true);
        } else {
          logger.info('[ONBOARDING-REQUIRED] Onboarding OBRIGATÓRIO (incluindo admins)');
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
