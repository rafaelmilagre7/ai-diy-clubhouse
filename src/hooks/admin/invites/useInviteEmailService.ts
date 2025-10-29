
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SendInviteResponse } from './types';
import { APP_CONFIG } from '@/config/app';
import { useInvitePerformanceOptimizer } from './useInvitePerformanceOptimizer';
import { showModernSuccess, showModernError } from '@/lib/toast-helpers';

interface SendInviteEmailParams {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
}

export function useInviteEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);
  const { measureInvitePerformance, isReady, metrics } = useInvitePerformanceOptimizer();

  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    forceResend = true,
  }: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      setSendError(null);

      // Validações básicas
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      // Usar medição de performance para monitorar a operação
      const { data, error } = await measureInvitePerformance(async () => {
        return await supabase.functions.invoke('send-invite-email', {
          body: {
            email,
            inviteUrl,
            roleName,
            expiresAt,
            senderName,
            notes,
            inviteId,
            forceResend
          }
        });
      }, `invite_email_${email}`);

      if (error) {
        console.error("❌ Erro da edge function:", error);
        throw new Error(`Erro no sistema de envio: ${error.message}`);
      }

      if (!data?.success) {
        console.error("❌ Sistema reportou falha:", data);
        throw new Error(data?.error || data?.message || 'Falha no envio');
      }

      // Feedback específico baseado na estratégia usada
      let successMessage = 'Convite enviado!';
      let description = '';
      
      switch (data.strategy) {
        case 'resend_primary':
          successMessage = 'Convite enviado com sucesso';
          description = 'Email enviado via Resend';
          break;
        case 'supabase_recovery':
          successMessage = 'Link de recuperação enviado';
          description = 'Link de acesso enviado';
          break;
        case 'supabase_auth':
          successMessage = 'Convite enviado';
          description = 'Via Supabase Auth';
          break;
      }

      showModernSuccess(successMessage, description, { duration: 4000 });

      return {
        success: true,
        message: successMessage,
        emailId: data.emailId || data.email,
        strategy: data.strategy,
        method: data.method
      };

    } catch (err: any) {
      console.error("❌ Erro final no envio:", err);
      setSendError(err);

      // Mensagens de erro mais específicas e úteis
      let errorMessage = 'Erro ao processar convite';
      let description = '';
      
      if (err.message?.includes('Email inválido')) {
        errorMessage = 'Email inválido';
        description = 'Verifique o formato do email';
      } else if (err.message?.includes('Todas as estratégias falharam')) {
        errorMessage = 'Falha no sistema de email';
        description = 'Verifique as configurações';
      } else if (err.message?.includes('URL do convite')) {
        errorMessage = 'Erro na geração do link';
        description = 'Tente recriar o convite';
      } else if (err.message?.includes('Resend falhou')) {
        errorMessage = 'Erro no envio de email';
        description = 'Sistema de fallback ativado';
      }

      showModernError(errorMessage, description, { duration: 6000 });

      return {
        success: false,
        message: errorMessage,
        error: err.message,
        suggestion: description
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
    
    // 🎯 CORREÇÃO: Usar o domínio configurado em vez do window.location.origin
    const baseUrl = APP_CONFIG.getAppUrl(`/convite/${encodeURIComponent(cleanToken)}`);
    
    return baseUrl;
  }, []);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    // Compatibilidade com versões antigas
    pendingEmails: 0,
    retryAllPendingEmails: () => {},
    clearEmailQueue: () => {},
    emailQueue: []
  };
}
