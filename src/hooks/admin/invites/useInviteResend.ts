
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
      
      // Verificar se o convite ainda é válido
      if (invite.used_at) {
        toast.error("Este convite já foi utilizado", {
          description: "Não é possível reenviar um convite que já foi utilizado."
        });
        return null;
      }
      
      if (new Date(invite.expires_at) < new Date()) {
        toast.error("Este convite já expirou", {
          description: "Não é possível reenviar um convite expirado."
        });
        return null;
      }
      
      // Buscar o nome do papel
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', invite.role_id)
        .single();
        
      // Validar o token antes de gerar o link
      if (!invite.token || invite.token.length < 6) {
        console.error("Token inválido encontrado no convite:", invite.token);
        toast.error("Erro ao reenviar convite", {
          description: "O token do convite é inválido. Crie um novo convite."
        });
        return null;
      }
      
      console.log("Reenviando convite com token:", invite.token, "comprimento:", invite.token.length);
      
      const inviteUrl = getInviteLink(invite.token);
      console.log("URL para reenvio:", inviteUrl);
      
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
