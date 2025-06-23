
import { useCallback } from 'react';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { InviteCache } from '@/utils/inviteCache';

export const useOnboardingCleanup = () => {
  const cleanupForInvite = useCallback(() => {
    console.log('[ONBOARDING-CLEANUP] Executando limpeza seletiva para convite');
    
    try {
      // Limpar cache antigo que pode estar inconsistente
      InviteCache.clear();
      
      // NÃO limpar o token aqui - deixar o fluxo gerenciar
      console.log('[ONBOARDING-CLEANUP] Limpeza seletiva concluída');
    } catch (error) {
      console.error('[ONBOARDING-CLEANUP] Erro na limpeza:', error);
    }
  }, []);

  const fullCleanup = useCallback(() => {
    console.log('[ONBOARDING-CLEANUP] Executando limpeza completa');
    
    try {
      InviteCache.clear();
      InviteTokenManager.clearToken();
      
      console.log('[ONBOARDING-CLEANUP] Limpeza completa concluída');
    } catch (error) {
      console.error('[ONBOARDING-CLEANUP] Erro na limpeza completa:', error);
    }
  }, []);

  return {
    cleanupForInvite,
    fullCleanup
  };
};
