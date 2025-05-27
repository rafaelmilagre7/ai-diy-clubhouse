
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';
import { useInviteEmailService } from './useInviteEmailService';

export function useInviteResend() {
  const [isSending, setIsSending] = useState(false);
  const [resendError, setResendError] = useState<Error | null>(null);
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();

  const resendInvite = useCallback(async (invite: Invite) => {
    try {
      setIsSending(true);
      setResendError(null);

      console.log("🔄 Reenviando convite:", invite.email);

      // Verificar apenas se não expirou (permitir reenvio mesmo se usado)
      if (new Date(invite.expires_at) < new Date()) {
        toast.error("Convite expirado - crie um novo convite");
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

      console.log("📧 Reenviando email...");

      // Reenviar email sempre (sem restrições)
      const sendResult = await sendInviteEmail({
        email: invite.email,
        inviteUrl,
        roleName: roleData?.name || invite.role?.name || 'membro',
        expiresAt: invite.expires_at,
        notes: invite.notes || undefined,
        inviteId: invite.id
      });

      if (sendResult.success) {
        toast.success(`Convite reenviado para ${invite.email}`, {
          description: sendResult.message
        });
      } else {
        toast.warning(`Tentativa de reenvio para ${invite.email}`, {
          description: sendResult.error || 'Verifique os logs se necessário'
        });
      }

      return {
        token: invite.token,
        expires_at: invite.expires_at,
        emailStatus: sendResult.success ? 'sent' : 'pending'
      };

    } catch (err: any) {
      console.error('❌ Erro ao reenviar:', err);
      setResendError(err);
      toast.error(`Erro ao reenviar: ${err.message}`);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [sendInviteEmail, getInviteLink]);

  return {
    isSending,
    resendInvite,
    resendError
  };
}
