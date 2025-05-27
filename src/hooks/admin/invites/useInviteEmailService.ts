
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

      console.log("🚀 Enviando convite:", { email, roleName });

      // Validações básicas
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      console.log("📧 Chamando edge function otimizada...");

      // Chamar edge function com retry automático
      let lastError;
      let attempts = 0;
      const maxAttempts = 2; // Reduzido para 2 tentativas

      while (attempts < maxAttempts) {
        attempts++;
        console.log(`📤 Tentativa ${attempts}/${maxAttempts}`);

        try {
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
            console.error(`❌ Erro da edge function (tentativa ${attempts}):`, error);
            lastError = error;
            
            // Se for erro de rede, tentar novamente
            if (attempts < maxAttempts && (
              error.message?.includes('fetch') ||
              error.message?.includes('network') ||
              error.message?.includes('timeout')
            )) {
              console.log("🔄 Tentando novamente em 1 segundo...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            throw new Error(`Erro no envio: ${error.message}`);
          }

          if (!data?.success) {
            console.error("❌ Falha reportada:", data);
            throw new Error(data?.message || 'Falha no envio');
          }

          console.log("✅ Email processado com sucesso:", {
            strategy: data.strategy,
            method: data.method,
            email: data.email
          });

          return {
            success: true,
            message: `Convite processado com sucesso (${data.strategy || 'padrão'})`,
            emailId: data.user_id
          };

        } catch (attemptError: any) {
          lastError = attemptError;
          if (attempts >= maxAttempts) {
            throw attemptError;
          }
          
          console.log(`⚠️ Tentativa ${attempts} falhou, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      throw lastError;

    } catch (err: any) {
      console.error("❌ Erro final no envio:", err);
      setSendError(err);

      return {
        success: false,
        message: 'Erro ao processar convite',
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
