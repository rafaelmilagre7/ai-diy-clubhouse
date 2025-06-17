
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
  forceResend?: boolean;
}

export function useInviteEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  const getInviteLink = useCallback((token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/convite/${token}`;
  }, []);

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

      console.log("🚀 Enviando convite via sistema corrigido:", { email, roleName, forceResend });

      // Validações básicas
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      console.log("📧 Chamando edge function corrigida...");

      // Chamar edge function corrigida
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
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
        email: data.email,
        emailId: data.emailId
      });

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
            console.log('Retentativa solicitada pelo usuário');
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

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError
  };
}
