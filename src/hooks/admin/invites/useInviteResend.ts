
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Invite } from './types';
import { useInviteChannelService } from './useInviteChannelService';
import { showModernError, showModernSuccess, showModernWarning } from '@/lib/toast-helpers';

export function useInviteResend() {
  const [isSending, setIsSending] = useState(false);
  const [resendError, setResendError] = useState<Error | null>(null);
  const { 
    getInviteLink, 
    sendHybridInvite
  } = useInviteChannelService();

  const resendInvite = useCallback(async (invite: Invite) => {
    try {
      setIsSending(true);
      setResendError(null);

      // Verificar apenas se não expirou (permitir reenvio mesmo se usado)
      if (new Date(invite.expires_at) < new Date()) {
        showModernError(
          'Convite expirado',
          'Crie um novo convite para este usuário'
        );
        return null;
      }

      // Buscar dados do papel
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', invite.role_id)
        .maybeSingle();

      const inviteUrl = getInviteLink(invite.token);
      
      if (!inviteUrl) {
        throw new Error("Erro ao gerar link do convite");
      }

      // Reenviar usando o sistema híbrido
      const sendResult = await sendHybridInvite({
        email: invite.email,
        phone: invite.whatsapp_number,
        inviteUrl,
        roleName: roleData?.name || invite.role?.name || 'membro',
        expiresAt: invite.expires_at,
        notes: invite.notes || undefined,
        inviteId: invite.id,
        channelPreference: invite.preferred_channel || 'email'
      });

      if (sendResult.success) {
        const channelText = invite.preferred_channel === 'both' ? 'email e WhatsApp' : 
                           invite.preferred_channel === 'whatsapp' ? 'WhatsApp' : 'email';
        showModernSuccess(
          'Convite reenviado!',
          `${invite.email} via ${channelText}`,
          { duration: 4000 }
        );
      } else {
        showModernWarning(
          'Falha no reenvio',
          `${invite.email}: ${sendResult.error || 'Verifique os logs'}`,
          { duration: 5000 }
        );
      }

      return {
        token: invite.token,
        expires_at: invite.expires_at,
        emailStatus: sendResult.success ? 'sent' : 'pending'
      };

    } catch (err: any) {
      console.error('❌ Erro ao reenviar:', err);
      setResendError(err);
      showModernError(
        'Erro ao reenviar convite',
        err.message || 'Falha no reenvio',
        { duration: 6000 }
      );
      return null;
    } finally {
      setIsSending(false);
    }
  }, [getInviteLink, sendHybridInvite]);

  return {
    isSending,
    resendInvite,
    resendError
  };
}
