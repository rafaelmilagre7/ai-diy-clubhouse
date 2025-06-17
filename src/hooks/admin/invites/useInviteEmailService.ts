
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
    setIsSending(true);
    setSendError(null);

    try {
      console.log("🚀 [INVITE-SERVICE] Iniciando envio de convite", { 
        email, 
        roleName, 
        forceResend,
        hasInviteId: !!inviteId 
      });

      // Validações básicas
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      console.log("📧 [INVITE-SERVICE] Chamando Edge Function com timeout...");

      // Chamada da Edge Function com timeout de 45 segundos
      const timeoutMs = 45000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const { data, error } = await Promise.race([
          supabase.functions.invoke('send-invite-email', {
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
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Frontend timeout')), timeoutMs);
          })
        ]) as any;

        clearTimeout(timeoutId);

        if (error) {
          console.error("❌ [INVITE-SERVICE] Erro da Edge Function:", error);
          
          // Retry logic for network errors
          if (error.message?.includes('Failed to send a request') || 
              error.message?.includes('network') || 
              error.message?.includes('timeout')) {
            
            console.log("🔄 [INVITE-SERVICE] Tentando novamente após erro de rede...");
            
            // Single retry after 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const { data: retryData, error: retryError } = await supabase.functions.invoke('send-invite-email', {
              body: {
                email,
                inviteUrl,
                roleName,
                expiresAt,
                senderName,
                notes,
                inviteId,
                forceResend: true
              }
            });

            if (retryError) {
              throw new Error(`Erro persistente: ${retryError.message}`);
            }

            if (!retryData?.success) {
              throw new Error(retryData?.error || 'Falha na tentativa de reenvio');
            }

            console.log("✅ [INVITE-SERVICE] Sucesso no retry:", retryData);
            
            // Success feedback for retry
            toast.success('Convite enviado após reenvio automático!', {
              description: `${retryData.strategy === 'resend_primary' ? 'Template profissional' : 'Sistema de backup'} usado com sucesso`,
              duration: 6000,
            });

            return {
              success: true,
              message: 'Convite enviado após retry automático',
              emailId: retryData.emailId,
              strategy: retryData.strategy,
              method: retryData.method
            };
          }

          throw new Error(`Erro no sistema de envio: ${error.message}`);
        }

        if (!data?.success) {
          console.error("❌ [INVITE-SERVICE] Sistema reportou falha:", data);
          throw new Error(data?.error || data?.message || 'Falha no envio');
        }

        console.log("✅ [INVITE-SERVICE] Email processado com sucesso:", {
          strategy: data.strategy,
          method: data.method,
          email: data.email,
          emailId: data.emailId
        });

        // Success feedback based on strategy used
        let successMessage = 'Convite enviado com sucesso!';
        let description = '';
        
        switch (data.strategy) {
          case 'resend_primary':
            successMessage = '🎉 Convite profissional enviado!';
            description = 'Email enviado via Resend com template premium da Viver de IA';
            break;
          case 'supabase_recovery':
            successMessage = '🔄 Link de recuperação enviado';
            description = 'Sistema de backup ativado - usuário receberá link de acesso';
            break;
          case 'supabase_auth':
            successMessage = '📧 Convite enviado via sistema alternativo';
            description = 'Sistema de fallback Supabase ativado com sucesso';
            break;
        }

        toast.success(successMessage, {
          description,
          duration: 6000,
        });

        return {
          success: true,
          message: successMessage,
          emailId: data.emailId || data.email,
          strategy: data.strategy,
          method: data.method
        };

      } catch (timeoutError) {
        clearTimeout(timeoutId);
        throw timeoutError;
      }

    } catch (err: any) {
      console.error("❌ [INVITE-SERVICE] Erro final no envio:", err);
      setSendError(err);

      // Specific error messages with actionable feedback
      let errorMessage = 'Erro ao processar convite';
      let description = '';
      let duration = 8000;
      
      if (err.message?.includes('Email inválido')) {
        errorMessage = '📧 Formato de email inválido';
        description = 'Verifique se o email está correto e tente novamente';
      } else if (err.message?.includes('timeout') || err.message?.includes('Frontend timeout')) {
        errorMessage = '⏰ Tempo limite excedido';
        description = 'O sistema demorou mais que o esperado. Tente novamente em alguns minutos.';
        duration = 10000;
      } else if (err.message?.includes('Failed to send a request')) {
        errorMessage = '🌐 Erro de conexão';
        description = 'Problema na comunicação com o servidor. Verifique sua conexão.';
      } else if (err.message?.includes('Erro persistente')) {
        errorMessage = '🔄 Sistema temporariamente indisponível';
        description = 'Múltiplas tentativas falharam. Tente novamente em alguns minutos.';
        duration = 12000;
      } else if (err.message?.includes('URL do convite')) {
        errorMessage = '🔗 Erro interno na geração do link';
        description = 'Tente recriar o convite';
      }

      toast.error(errorMessage, {
        description,
        duration,
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            console.log('🔄 [INVITE-SERVICE] Retentativa solicitada pelo usuário');
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
