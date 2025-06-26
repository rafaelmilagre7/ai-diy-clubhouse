
import { useState, useEffect } from 'react';
import AuthManager from '@/services/AuthManager';
import { logger } from '@/utils/logger';

export const useCleanOnboardingData = () => {
  const authManager = AuthManager.getInstance();
  const [cleanData, setCleanData] = useState(() => {
    const currentState = authManager.getState();
    return {
      user: currentState.user,
      profile: currentState.profile,
      isLoading: currentState.isLoading,
      shouldShowOnboarding: currentState.onboardingRequired
    };
  });

  useEffect(() => {
    logger.info('[CLEAN-ONBOARDING-DATA] 🔗 Conectando ao AuthManager', {
      component: 'useCleanOnboardingData',
      action: 'connect_auth_manager'
    });

    // CORREÇÃO: criar função handler que aceita AuthState como argumento
    const handleStateChanged = (authState) => {
      logger.info('[CLEAN-ONBOARDING-DATA] 📡 Dados limpos atualizados', {
        component: 'useCleanOnboardingData',
        action: 'data_updated',
        hasUser: !!authState.user,
        hasProfile: !!authState.profile,
        shouldShowOnboarding: authState.onboardingRequired
      });

      setCleanData({
        user: authState.user,
        profile: authState.profile,
        isLoading: authState.isLoading,
        shouldShowOnboarding: authState.onboardingRequired
      });
    };

    const unsubscribe = authManager.on('stateChanged', handleStateChanged);

    // Initialize if needed
    if (!authManager.isInitialized) {
      logger.info('[CLEAN-ONBOARDING-DATA] 🚀 Forçando inicialização do AuthManager');
      authManager.initialize();
    }

    return () => {
      authManager.off('stateChanged', handleStateChanged);
    };
  }, [authManager]);

  return cleanData;
};
