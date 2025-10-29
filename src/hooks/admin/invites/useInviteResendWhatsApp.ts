import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Invite } from './types';
import { APP_CONFIG } from '@/config/app';
import { showModernError, showModernSuccess } from '@/lib/toast-helpers';

export function useInviteResendWhatsApp() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  const resendWhatsApp = useCallback(async (invite: Invite) => {
    try {
      setIsSending(true);
      setSendError(null);

      // Verificar se não expirou
      if (new Date(invite.expires_at) < new Date()) {
        showModernError('Convite expirado', 'Crie um novo convite para este usuário');
        return null;
      }

      // Verificar se tem telefone
      if (!invite.whatsapp_number) {
        showModernError('Telefone não cadastrado', 'Este convite não possui número de telefone');
        return null;
      }

      // Buscar dados do papel
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', invite.role_id)
        .maybeSingle();

      const inviteUrl = APP_CONFIG.getAppUrl(`/convite/${invite.token}`);

      // Enviar WhatsApp usando o template aprovado "convitevia"
      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone: invite.whatsapp_number,
          inviteUrl,
          roleName: roleData?.name || invite.role?.name || 'membro',
          expiresAt: invite.expires_at,
          senderName: 'Administrador',
          notes: invite.notes || undefined,
          inviteId: invite.id,
          email: invite.email
        }
      });

      if (error) {
        throw new Error(`Erro da função: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.message || data?.error || 'Resposta inválida da função');
      }

      showModernSuccess(
        'WhatsApp reenviado!',
        `Enviado para ${invite.whatsapp_number}`,
        { duration: 4000 }
      );

      return {
        success: true,
        messageId: data.whatsappId,
        phone: data.phone
      };

    } catch (err: any) {
      console.error('❌ Erro ao reenviar WhatsApp:', err);
      setSendError(err);
      showModernError('Erro ao reenviar WhatsApp', err.message, { duration: 6000 });
      return null;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    isSending,
    resendWhatsApp,
    sendError
  };
}