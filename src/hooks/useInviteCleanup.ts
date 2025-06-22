
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useInviteCleanup = () => {
  const { user } = useAuth();

  const cleanupForInvite = useCallback(async (inviteToken?: string) => {
    if (!inviteToken || !user?.id) return;

    console.log('[INVITE-CLEANUP] Iniciando limpeza para convite:', inviteToken.substring(0, 8) + '...');

    // 1. Limpar localStorage de onboarding
    const onboardingKeys = [
      'viver-ia-onboarding-data',
      'onboarding-wizard-step',
      'onboarding-completed'
    ];

    onboardingKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('[INVITE-CLEANUP] Removido do localStorage:', key);
    });

    // 2. Limpar dados de onboarding no banco para permitir reinício
    try {
      const cleanupPromises = [
        supabase.from('user_onboarding').delete().eq('user_id', user.id),
        supabase.from('onboarding_sync').delete().eq('user_id', user.id),
        supabase.from('onboarding_final').delete().eq('user_id', user.id)
      ];

      await Promise.all(cleanupPromises);
      console.log('[INVITE-CLEANUP] Dados de onboarding limpos do banco');

      // 3. Resetar flag de onboarding_completed no perfil
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null
        })
        .eq('id', user.id);

      console.log('[INVITE-CLEANUP] Perfil resetado para permitir novo onboarding');

    } catch (error) {
      console.error('[INVITE-CLEANUP] Erro na limpeza do banco:', error);
    }

    console.log('[INVITE-CLEANUP] Limpeza concluída com sucesso');
  }, [user?.id]);

  return { cleanupForInvite };
};
