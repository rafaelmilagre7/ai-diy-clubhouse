
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
      // TIMEOUT AGRESSIVO: máximo 2 segundos
      const timeout = setTimeout(() => {
        logger.warn('[ONBOARDING-REQUIRED] ⏰ TIMEOUT 2s - assumindo onboarding necessário', {
          hasUser: !!user,
          hasProfile: !!profile,
          authLoading
        });
        
        if (!user) {
          setIsRequired(false);
          setHasCompleted(false);
        } else {
          // Se há usuário mas não conseguiu determinar, assumir que precisa
          setIsRequired(true);
          setHasCompleted(false);
        }
        setIsLoading(false);
      }, 2000);

      if (authLoading || !user) {
        logger.info('[ONBOARDING-REQUIRED] Aguardando auth ou usuário', {
          authLoading,
          hasUser: !!user
        });
        return () => clearTimeout(timeout);
      }

      try {
        logger.info('[ONBOARDING-REQUIRED] 🔍 Verificação RÁPIDA de onboarding', {
          userId: user.id.substring(0, 8) + '***',
          email: user.email,
          hasProfile: !!profile
        });
        
        // MUDANÇA CRÍTICA: Admin nunca precisa de onboarding
        const userRole = profile?.user_roles?.name;
        if (userRole === 'admin') {
          logger.info('[ONBOARDING-REQUIRED] 👑 Admin detectado - dispensando onboarding', {});
          setIsRequired(false);
          setHasCompleted(true);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        // Se não há perfil, aguardar apenas 500ms adicionais
        if (!profile) {
          logger.warn('[ONBOARDING-REQUIRED] ⏳ Aguardando perfil por 500ms...', {});
          setTimeout(() => {
            if (!profile) {
              logger.warn('[ONBOARDING-REQUIRED] ⚠️ Timeout perfil - assumindo onboarding necessário', {});
              setIsRequired(true);
              setHasCompleted(false);
              setIsLoading(false);
            }
          }, 500);
          return () => clearTimeout(timeout);
        }
        
        // Para outros usuários, verificar se completaram
        const onboardingCompleted = profile?.onboarding_completed === true;
        
        logger.info('[ONBOARDING-REQUIRED] ✅ Status determinado para usuário não-admin', {
          userId: user.id.substring(0, 8) + '***',
          onboardingCompleted,
          userRole
        });

        setIsRequired(!onboardingCompleted);
        setHasCompleted(onboardingCompleted);
        setIsLoading(false);
        clearTimeout(timeout);
        
      } catch (error) {
        logger.error('[ONBOARDING-REQUIRED] ❌ Erro - assumindo onboarding necessário', error);
        setIsRequired(true);
        setHasCompleted(false);
        setIsLoading(false);
        clearTimeout(timeout);
      }

      return () => clearTimeout(timeout);
    };

    checkOnboardingRequirement();
  }, [user, profile, authLoading]);

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
