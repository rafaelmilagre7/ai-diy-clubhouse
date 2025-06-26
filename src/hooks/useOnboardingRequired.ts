
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
    logger.info('[ONBOARDING-REQUIRED] 🔗 Conectando ao AuthManager', {
      component: 'useOnboardingRequired',
      action: 'connect_auth_manager'
    });

    const unsubscribe = authManager.on('stateChanged', (authState) => {
      logger.info('[ONBOARDING-REQUIRED] 📡 Estado atualizado via AuthManager', {
        component: 'useOnboardingRequired',
        action: 'state_updated',
        onboardingRequired: authState.onboardingRequired,
        isAdmin: authState.isAdmin,
        hasUser: !!authState.user
      });

      setState({
        isRequired: authState.onboardingRequired,
        hasCompleted: !authState.onboardingRequired,
        isLoading: authState.isLoading
      });
    });

    // Initialize if needed
    if (!authManager.isInitialized()) {
      authManager.initialize();
    }

    return unsubscribe;
  }, [authManager]);

  return state;
};
