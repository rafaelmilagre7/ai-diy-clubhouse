
import { useCallback } from 'react';

export const useOnboardingCleanup = () => {
  const cleanupForInvite = useCallback(() => {
    try {
      // Limpeza simples de dados de onboarding anterior
      const keysToRemove = [
        'viver-ia-onboarding-data',
        'viver-ia-onboarding-step',
        'viver-ia-onboarding-temp'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      console.log('[ONBOARDING-CLEANUP] Limpeza concluída para fluxo de convite');
    } catch (error) {
      console.warn('[ONBOARDING-CLEANUP] Erro na limpeza:', error);
    }
  }, []);

  const cleanupOnComplete = useCallback(() => {
    try {
      // Limpeza após conclusão do onboarding
      const keysToRemove = [
        'viver-ia-onboarding-data',
        'viver-ia-onboarding-step',
        'viver-ia-onboarding-temp',
        'viver_invite_token',
        'viver_invite_token_expiry'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      console.log('[ONBOARDING-CLEANUP] Limpeza completa após conclusão');
    } catch (error) {
      console.warn('[ONBOARDING-CLEANUP] Erro na limpeza final:', error);
    }
  }, []);

  return {
    cleanupForInvite,
    cleanupOnComplete
  };
};
