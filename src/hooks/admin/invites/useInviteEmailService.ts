
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

      console.log("🚀 Enviando convite robusto:", { email, roleName });

      // Validações básicas
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      console.log("📧 Chamando sistema híbrido (Supabase + Resend)...");

      // Chamar edge function com sistema híbrido robusto
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
        throw new Error(`Erro no sistema de envio: ${error.message}`);
      }

      if (!data?.success) {
        console.error("❌ Sistema reportou falha:", data);
        throw new Error(data?.error || data?.message || 'Falha no envio');
      }

      console.log("✅ Email processado com sucesso:", {
        strategy: data.strategy,
        method: data.method,
        email: data.email
      });

      // Feedback específico baseado na estratégia usada
      let successMessage = 'Convite enviado com sucesso!';
      if (data.strategy === 'resend_fallback') {
        successMessage = 'Convite enviado via sistema de backup (Resend)';
      } else if (data.strategy === 'supabase_recovery') {
        successMessage = 'Link de recuperação enviado (usuário existente)';
      } else if (data.strategy === 'supabase_auth') {
        successMessage = 'Convite enviado via Supabase Auth';
      }

      return {
        success: true,
        message: successMessage,
        emailId: data.email
      };

    } catch (err: any) {
      console.error("❌ Erro final no envio:", err);
      setSendError(err);

      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao processar convite';
      if (err.message?.includes('Email inválido')) {
        errorMessage = 'Formato de email inválido';
      } else if (err.message?.includes('Todas as estratégias falharam')) {
        errorMessage = 'Falha completa do sistema - verifique configurações';
      } else if (err.message?.includes('URL do convite')) {
        errorMessage = 'Erro interno na geração do link';
      }

      return {
        success: false,
        message: errorMessage,
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
    pendingEmails: 0,
    retryAllPendingEmails: () => {},
    clearEmailQueue: () => {},
    emailQueue: []
  };
}
