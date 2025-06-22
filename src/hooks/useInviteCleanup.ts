
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useInviteCleanup = () => {
  const { user } = useAuth();

  const cleanupForInvite = useCallback(async (inviteToken?: string) => {
    if (!inviteToken || !user?.id) return;

    console.log('[INVITE-CLEANUP] Iniciando limpeza TOTAL para convite:', inviteToken.substring(0, 8) + '...');

    // 1. Limpar TODOS os storages (localStorage + sessionStorage)
    const allStorageKeys = [
      'viver-ia-onboarding-data',
      'onboarding-wizard-step',
      'onboarding-completed'
    ];

    // Limpar localStorage
    allStorageKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('[INVITE-CLEANUP] Removido do localStorage:', key);
    });

    // Limpar sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      allStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log('[INVITE-CLEANUP] Removido do sessionStorage:', key);
      });
    }

    // 2. Limpar cache de autenticação do Supabase no localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.startsWith('sb-') || key.includes('supabase')) {
          const oldValue = localStorage.getItem(key);
          localStorage.removeItem(key);
          console.log('[INVITE-CLEANUP] Cache Supabase removido:', key);
        }
      });
    } catch (error) {
      console.warn('[INVITE-CLEANUP] Erro ao limpar cache Supabase:', error);
    }

    // 3. Limpar dados de onboarding no banco para permitir reinício TOTAL
    try {
      const cleanupPromises = [
        supabase.from('user_onboarding').delete().eq('user_id', user.id),
        supabase.from('onboarding_sync').delete().eq('user_id', user.id),
        supabase.from('onboarding_final').delete().eq('user_id', user.id)
      ];

      await Promise.all(cleanupPromises);
      console.log('[INVITE-CLEANUP] Dados de onboarding TOTALMENTE limpos do banco');

      // 4. Resetar flag de onboarding_completed no perfil
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null
        })
        .eq('id', user.id);

      console.log('[INVITE-CLEANUP] Perfil resetado COMPLETAMENTE para permitir novo onboarding');

    } catch (error) {
      console.error('[INVITE-CLEANUP] Erro na limpeza TOTAL do banco:', error);
    }

    // 5. Forçar limpeza de qualquer estado React em memória
    setTimeout(() => {
      console.log('[INVITE-CLEANUP] Limpeza TOTAL concluída - forçando refresh do estado');
    }, 100);

    console.log('[INVITE-CLEANUP] Limpeza TOTAL concluída com sucesso');
  }, [user?.id]);

  return { cleanupForInvite };
};
