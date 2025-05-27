
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse } from './types';

interface SendInviteEmailParams {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  retryCount?: number;
}

export function useInviteEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);
  const [emailQueue, setEmailQueue] = useState<SendInviteEmailParams[]>([]);

  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    retryCount = 0,
  }: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      setSendError(null);

      console.log("🚀 Enviando convite:", { email, roleName, retryCount });

      // Validações
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId
        }
      });

      if (error) {
        console.error("❌ Erro da edge function:", error);
        throw new Error(`Erro no envio: ${error.message}`);
      }

      if (!data?.success) {
        console.error("❌ Falha reportada:", data);
        throw new Error(data?.message || 'Falha no envio');
      }

      console.log("✅ Email enviado:", data);

      // Remover da fila se estava em retry
      if (retryCount > 0) {
        setEmailQueue(prev => prev.filter(item => 
          item.email !== email || item.inviteId !== inviteId
        ));
      }

      // Atualizar estatísticas do convite
      if (inviteId) {
        try {
          await supabase.rpc('update_invite_send_attempt', {
            invite_id: inviteId
          });
        } catch (statsError) {
          console.warn("Erro ao atualizar estatísticas:", statsError);
        }
      }

      return {
        success: true,
        message: 'Email enviado com sucesso',
        emailId: data.emailId
      };

    } catch (err: any) {
      console.error("❌ Erro no envio:", err);
      setSendError(err);

      // Sistema de retry para erros temporários
      if (retryCount < 3) {
        const retryParams = {
          email, inviteUrl, roleName, expiresAt,
          senderName, notes, inviteId,
          retryCount: retryCount + 1
        };

        // Adicionar à fila
        setEmailQueue(prev => {
          const exists = prev.some(item => 
            item.email === email && item.inviteId === inviteId
          );
          return exists ? prev : [...prev, retryParams];
        });

        // Programar retry
        const retryDelay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
        setTimeout(() => {
          sendInviteEmail(retryParams);
        }, retryDelay);

        return {
          success: false,
          message: `Erro no envio, tentativa ${retryCount + 1}/3 programada`,
          error: err.message,
          willRetry: true
        };
      }

      return {
        success: false,
        message: 'Erro ao enviar email',
        error: err.message
      };
    } finally {
      setIsSending(false);
    }
  }, []);

  const getInviteLink = useCallback((token: string) => {
    if (!token?.trim()) {
      console.error("❌ Token vazio");
      return "";
    }

    const cleanToken = token.trim();
    const baseUrl = `${window.location.origin}/convite/${encodeURIComponent(cleanToken)}`;
    
    console.log("🔗 Link gerado:", baseUrl);
    return baseUrl;
  }, []);

  const clearEmailQueue = useCallback(() => {
    console.log("🧹 Limpando fila de emails");
    setEmailQueue([]);
  }, []);

  const retryAllPendingEmails = useCallback(async () => {
    const pendingEmails = [...emailQueue];
    console.log(`🔄 Reenviando ${pendingEmails.length} emails`);

    if (pendingEmails.length === 0) {
      toast.info("Nenhum email pendente");
      return;
    }

    clearEmailQueue();
    let successCount = 0;

    for (const params of pendingEmails) {
      try {
        const result = await sendInviteEmail(params);
        if (result.success) {
          successCount++;
        }
      } catch (error) {
        console.error(`Erro ao reenviar para ${params.email}:`, error);
      }
      
      // Pausa entre envios
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (successCount > 0) {
      toast.success(`${successCount} email(s) reenviado(s)`);
    }
  }, [emailQueue, clearEmailQueue, sendInviteEmail]);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    pendingEmails: emailQueue.length,
    retryAllPendingEmails,
    clearEmailQueue,
    emailQueue
  };
}
