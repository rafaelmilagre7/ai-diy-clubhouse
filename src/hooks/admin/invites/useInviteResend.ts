
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInviteEmailService } from './useInviteEmailService';
import { supabase } from '@/lib/supabase';
import type { Invite } from './types';

export const useInviteResend = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();

  const resendInvite = async (invite: Invite) => {
    try {
      setIsSending(true);

      console.log("🔄 Reenviando convite:", {
        inviteId: invite.id,
        email: invite.email,
        token: invite.token
      });

      const inviteUrl = getInviteLink(invite.token);
      const roleName = invite.role?.name || 'Membro';

      toast({
        title: "Reenviando convite...",
        description: `Preparando reenvio para ${invite.email}`,
      });

      const emailResult = await sendInviteEmail({
        email: invite.email,
        inviteUrl,
        roleName,
        expiresAt: invite.expires_at,
        notes: invite.notes || undefined,
        inviteId: invite.id,
        forceResend: true
      });

      if (!emailResult.success) {
        console.error('❌ Falha no reenvio:', emailResult.error);
        
        toast({
          title: "Falha no reenvio",
          description: emailResult.error || 'Não foi possível reenviar o convite',
          variant: "destructive",
        });

        throw new Error(emailResult.error || 'Falha no reenvio');
      }

      // Atualizar registro de envio
      await supabase.rpc('update_invite_send_attempt', {
        invite_id: invite.id
      });

      toast({
        title: "Convite reenviado! ✅",
        description: `Email enviado para ${invite.email}. Método: ${emailResult.strategy || 'Sistema principal'}`,
        duration: 5000,
      });

      console.log("✅ Reenvio concluído:", {
        inviteId: invite.id,
        emailStrategy: emailResult.strategy,
        emailId: emailResult.emailId
      });

    } catch (error: any) {
      console.error('❌ Erro no reenvio:', error);
      
      toast({
        title: "Erro no reenvio",
        description: error.message || 'Erro inesperado ao reenviar convite',
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { resendInvite, isSending };
};
