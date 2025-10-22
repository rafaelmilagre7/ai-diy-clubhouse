
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse } from './types';
import { APP_CONFIG } from '@/config/app';
import { useInvitePerformanceOptimizer } from './useInvitePerformanceOptimizer';

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
      let successMessage = 'Convite enviado com sucesso!';
      let description = '';
      
      switch (data.strategy) {
        case 'resend_primary':
          successMessage = 'Convite enviado com design profissional!';
          description = 'Email enviado via Resend com template da Viver de IA';
          break;
        case 'supabase_recovery':
          successMessage = 'Link de recuperação enviado';
          description = 'Usuário existente - link de acesso enviado';
          break;
        case 'supabase_auth':
          successMessage = 'Convite enviado via Supabase Auth';
          description = 'Sistema alternativo ativado com sucesso';
          break;
      }

      // Mostrar toast de sucesso com detalhes
      toast.success(successMessage, {
        description,
        duration: 5000,
      });

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
        errorMessage = 'Formato de email inválido';
        description = 'Verifique se o email está correto';
      } else if (err.message?.includes('Todas as estratégias falharam')) {
        errorMessage = 'Falha completa do sistema de email';
        description = 'Verifique as configurações do Resend e tente novamente';
      } else if (err.message?.includes('URL do convite')) {
        errorMessage = 'Erro interno na geração do link';
        description = 'Tente recriar o convite';
      } else if (err.message?.includes('Resend falhou')) {
        errorMessage = 'Erro no sistema principal de email';
        description = 'Sistema de fallback pode ter sido usado';
      }

      // Toast de erro com ação sugerida
      toast.error(errorMessage, {
        description,
        duration: 8000,
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            // Re-trigger do envio seria implementado aqui
          },
        },
      });

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
