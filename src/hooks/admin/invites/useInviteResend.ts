
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';

export function useInviteResend() {
  const [isSending, setIsSending] = useState(false);

  const resendInvite = useCallback(async (invite: Invite): Promise<void> => {
    setIsSending(true);
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`🔄 [${requestId}] Reenviando convite:`, invite.email);

      // Gerar URL correta do convite
      const inviteUrl = `${window.location.origin}/accept-invite/${invite.token}`;
      
      // Buscar dados do criador
      const { data: creator } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', invite.created_by)
        .single();

      // Enviar email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: invite.email,
          inviteUrl,
          roleName: invite.role?.name || 'Usuário',
          expiresAt: invite.expires_at,
          senderName: creator?.name || 'Administrador',
          notes: invite.notes,
          inviteId: invite.id,
          forceResend: true,
          requestId
        }
      });

      if (emailError) {
        console.error(`❌ [${requestId}] Erro na Edge Function:`, emailError);
        throw new Error(`Erro no envio: ${emailError.message}`);
      }

      if (!emailResult?.success) {
        console.error(`❌ [${requestId}] Falha no reenvio:`, emailResult);
        throw new Error(emailResult?.message || 'Falha no reenvio do email');
      }

      console.log(`✅ [${requestId}] Convite reenviado com sucesso!`);
      
      toast.success('Convite reenviado!', {
        description: `Email enviado novamente para ${invite.email}`
      });

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erro ao reenviar:`, error);
      
      toast.error('Erro ao reenviar convite', {
        description: error.message || 'Erro desconhecido'
      });
      
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    resendInvite,
    isSending
  };
}
