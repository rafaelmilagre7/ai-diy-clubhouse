
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
}

export function useInviteEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
  }: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      setSendError(null);

      console.log("🚀 Enviando convite nativo:", { email, roleName });

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

      console.log("✅ Email nativo enviado:", data);

      return {
        success: true,
        message: 'Email enviado com sucesso via Supabase',
        emailId: data.user_id
      };

    } catch (err: any) {
      console.error("❌ Erro no envio:", err);
      setSendError(err);

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

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    pendingEmails: 0, // Não precisamos mais de fila complexa
    retryAllPendingEmails: () => {}, // Função vazia para compatibilidade
    clearEmailQueue: () => {}, // Função vazia para compatibilidade
    emailQueue: [] // Array vazio para compatibilidade
  };
}
