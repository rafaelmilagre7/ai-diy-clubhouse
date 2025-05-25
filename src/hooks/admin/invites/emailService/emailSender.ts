
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SendInviteEmailParams, SendInviteResponse } from './types';

export function useEmailSender() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  const sendEmail = useCallback(async (params: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      setSendError(null);

      // Validação da URL
      if (!params.inviteUrl || !params.inviteUrl.includes('/convite/') || params.inviteUrl.length < 20) {
        console.error("URL inválida gerada para o convite:", params.inviteUrl);
        setSendError(new Error('URL inválida gerada'));
        return {
          success: false,
          message: 'Erro ao gerar URL do convite',
          error: 'URL inválida gerada'
        };
      }
      
      console.log("Enviando convite por email: ", {
        email: params.email,
        inviteUrl: params.inviteUrl,
        roleName: params.roleName,
        retryAttempt: params.retryCount
      });
      
      // Timeout promise
      const timeoutPromise = new Promise<{ error: string }>((_, reject) => 
        setTimeout(() => reject({ error: 'Tempo limite excedido ao enviar email' }), 30000)
      );
      
      // Chamar a edge function
      const resultPromise = supabase.functions.invoke('send-invite-email', {
        body: {
          email: params.email,
          inviteUrl: params.inviteUrl,
          roleName: params.roleName,
          expiresAt: params.expiresAt,
          senderName: params.senderName,
          notes: params.notes,
          inviteId: params.inviteId
        }
      });
      
      const { data, error } = await Promise.race([
        resultPromise,
        timeoutPromise.then((e) => { throw e; })
      ]) as { data: any, error: Error | null };
      
      if (error) {
        console.error("Erro ao chamar a edge function:", error);
        setSendError(error);
        return {
          success: false,
          message: 'Erro ao enviar e-mail de convite',
          error: error.message || 'Falha na conexão com o servidor'
        };
      }
      
      console.log("Resposta da edge function:", data);
      
      if (!data.success) {
        console.error("Edge function reportou erro:", data.error || data.message);
        setSendError(new Error(data.message || data.error || 'Erro ao enviar e-mail'));
        
        return {
          success: false,
          message: data.message || 'Erro ao enviar e-mail',
          error: data.error
        };
      }
      
      return {
        success: true,
        message: 'Email enviado com sucesso',
        emailId: data.emailId
      };
    } catch (err: any) {
      console.error('Erro ao enviar email de convite:', err);
      setSendError(err);
      
      return {
        success: false,
        message: 'Erro ao enviar email de convite',
        error: err.message
      };
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    sendEmail,
    isSending,
    sendError
  };
}
