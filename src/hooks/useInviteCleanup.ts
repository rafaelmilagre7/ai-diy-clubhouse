
import { useCallback } from 'react';

export const useInviteCleanup = () => {
  const cleanupForInvite = useCallback(async (inviteToken?: string) => {
    if (!inviteToken) return;

    console.log('[INVITE-CLEANUP] Limpeza seletiva para convite:', inviteToken.substring(0, 8) + '...');

    // Limpeza seletiva APENAS do localStorage - não tocar no banco
    const storageKeysToClean = [
      'viver-ia-onboarding-data',
      'onboarding-wizard-step',
      'onboarding-completed'
    ];

    // Limpar apenas keys específicas do localStorage
    storageKeysToClean.forEach(key => {
      const oldValue = localStorage.getItem(key);
      if (oldValue) {
        localStorage.removeItem(key);
        console.log('[INVITE-CLEANUP] Removido do localStorage:', key);
      }
    });

    // Limpar sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      storageKeysToClean.forEach(key => {
        const oldValue = sessionStorage.getItem(key);
        if (oldValue) {
          sessionStorage.removeItem(key);
          console.log('[INVITE-CLEANUP] Removido do sessionStorage:', key);
        }
      });
    }

    console.log('[INVITE-CLEANUP] Limpeza seletiva concluída - banco de dados preservado');
  }, []);

  return { cleanupForInvite };
};
