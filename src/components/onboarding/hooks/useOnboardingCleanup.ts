
import { useCallback } from 'react';

/**
 * Hook focado exclusivamente na limpeza seletiva de dados do onboarding
 * Para convites e fluxos de usuário
 */
export const useOnboardingCleanup = () => {
  const cleanupForInvite = useCallback(() => {
    console.log('[ONBOARDING-CLEANUP] Limpeza seletiva para convite');

    // Lista específica de keys para limpar
    const storageKeysToClean = [
      'viver-ia-onboarding-data',
      'onboarding-wizard-step',
      'onboarding-completed'
    ];

    // Limpar localStorage
    storageKeysToClean.forEach(key => {
      const oldValue = localStorage.getItem(key);
      if (oldValue) {
        localStorage.removeItem(key);
        console.log('[ONBOARDING-CLEANUP] Removido do localStorage:', key);
      }
    });

    // Limpar sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      storageKeysToClean.forEach(key => {
        const oldValue = sessionStorage.getItem(key);
        if (oldValue) {
          sessionStorage.removeItem(key);
          console.log('[ONBOARDING-CLEANUP] Removido do sessionStorage:', key);
        }
      });
    }

    console.log('[ONBOARDING-CLEANUP] Limpeza concluída');
  }, []);

  const cleanupComplete = useCallback(() => {
    console.log('[ONBOARDING-CLEANUP] Limpeza completa após finalização');
    
    // Limpar todos os dados temporários do onboarding
    const allOnboardingKeys = [
      'viver-ia-onboarding-data',
      'onboarding-wizard-step',
      'onboarding-completed',
      'onboarding-temp-data'
    ];

    allOnboardingKeys.forEach(key => {
      localStorage.removeItem(key);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    });

    console.log('[ONBOARDING-CLEANUP] Limpeza completa finalizada');
  }, []);

  return {
    cleanupForInvite,
    cleanupComplete
  };
};
