
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';
import { useInviteEmailService } from './useInviteEmailService';

export function useInviteResend() {
  const [isSending, setIsSending] = useState(false);
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();

  // Reenviar convite
  const resendInvite = useCallback(async (invite: Invite) => {
    try {
      setIsSending(true);
      
      // Buscar o nome do papel
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', invite.role_id)
        .single();
        
      const inviteUrl = getInviteLink(invite.token);
      
      const sendResult = await sendInviteEmail({
        email: invite.email,
        inviteUrl: inviteUrl,
        roleName: roleData?.name || invite.role?.name || 'membro',
        expiresAt: invite.expires_at,
        notes: invite.notes || undefined,
        inviteId: invite.id // Passar o ID do convite para atualizar estatísticas
      });
      
      if (sendResult.success) {
        toast.success('Convite reenviado com sucesso', {
          description: `Um novo e-mail foi enviado para ${invite.email}.`
        });
      } else {
        toast.error('Erro ao reenviar convite', {
          description: sendResult.error || 'Não foi possível reenviar o e-mail.'
        });
      }

      return {
        token: invite.token,
        expires_at: invite.expires_at
      };
    } catch (err: any) {
      console.error('Erro ao reenviar convite:', err);
      toast.error('Erro ao reenviar convite', {
        description: err.message || 'Não foi possível reenviar o convite.'
      });
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [sendInviteEmail, getInviteLink]);

  return {
    isSending,
    resendInvite
  };
}
