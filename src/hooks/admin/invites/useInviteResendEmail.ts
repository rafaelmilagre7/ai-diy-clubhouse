import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Invite } from './types';
import { useInviteEmailService } from './useInviteEmailService';
import { showModernError, showModernSuccess } from '@/lib/toast-helpers';

export function useInviteResendEmail() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();

  const resendEmail = useCallback(async (invite: Invite) => {
    try {
      setIsSending(true);
      setSendError(null);

      // Verificar se não expirou
      if (new Date(invite.expires_at) < new Date()) {
        showModernError('Convite expirado', 'Crie um novo convite para este usuário');
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

      // Enviar email
      const result = await sendInviteEmail({
        email: invite.email,
        inviteUrl,
        roleName: roleData?.name || invite.role?.name || 'membro',
        expiresAt: invite.expires_at,
        senderName: 'Administrador',
        notes: invite.notes || undefined,
        inviteId: invite.id,
        forceResend: true
      });

      if (result.success) {
        showModernSuccess('Email reenviado!', `Enviado para ${invite.email}`);
      } else {
        throw new Error(result.error || 'Falha no envio do email');
      }

      return result;

    } catch (err: any) {
      console.error('❌ Erro ao reenviar email:', err);
      setSendError(err);
      showModernError('Erro ao reenviar email', err.message, { duration: 6000 });
      return null;
    } finally {
      setIsSending(false);
    }
  }, [sendInviteEmail, getInviteLink]);

  return {
    isSending,
    resendEmail,
    sendError
  };
}