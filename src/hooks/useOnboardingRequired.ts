
import { useState, useEffect } from 'react';
import AuthManager from '@/services/AuthManager';
import { logger } from '@/utils/logger';

export const useOnboardingRequired = () => {
  const authManager = AuthManager.getInstance();
  const [state, setState] = useState(() => {
    const currentState = authManager.getState();
    return {
      isRequired: currentState.onboardingRequired,
      hasCompleted: !currentState.onboardingRequired,
      isLoading: currentState.isLoading
    };
  });

  useEffect(() => {
    logger.info('[ONBOARDING-REQUIRED] 🔗 Conectando ao AuthManager');

    // CORREÇÃO: criar função handler que aceita AuthState como argumento
    const handleStateChanged = (authState) => {
      // CORREÇÃO CRÍTICA: Admin NUNCA precisa de onboarding
      if (authState.isAdmin) {
        logger.info('[ONBOARDING-REQUIRED] 👑 ADMIN DETECTADO - Onboarding dispensado', {
          userId: authState.user?.id?.substring(0, 8) + '***' || 'none',
          isAdmin: authState.isAdmin,
          originalOnboardingRequired: authState.onboardingRequired
        });

        setState({
          isRequired: false, // SEMPRE false para admin
          hasCompleted: true, // SEMPRE true para admin
          isLoading: authState.isLoading
        });
        return;
      }

      // Para não-admin, usar o estado normal
      logger.info('[ONBOARDING-REQUIRED] 📊 Estado atualizado via AuthManager:', {
        onboardingRequired: authState.onboardingRequired,
        isAdmin: authState.isAdmin,
        hasUser: !!authState.user,
        isLoading: authState.isLoading,
        userRole: authState.profile?.user_roles?.name
      });

      setState({
        isRequired: authState.onboardingRequired,
        hasCompleted: !authState.onboardingRequired,
        isLoading: authState.isLoading
      });
    };

    // CORREÇÃO PRINCIPAL: usar o unsubscribe retornado pelo método 'on'
    const unsubscribe = authManager.on('stateChanged', handleStateChanged);

    // Initialize if needed
    if (!authManager.isInitialized) {
      logger.info('[ONBOARDING-REQUIRED] 🚀 Forçando inicialização do AuthManager');
      authManager.initialize();
    }

    return () => {
      // CORREÇÃO: usar unsubscribe em vez de authManager.off
      unsubscribe();
    };
  }, [authManager]);

  logger.debug('[ONBOARDING-REQUIRED] 📊 Estado atual:', {
    isRequired: state.isRequired,
    hasCompleted: state.hasCompleted,
    isLoading: state.isLoading
  });

  return state;
};
