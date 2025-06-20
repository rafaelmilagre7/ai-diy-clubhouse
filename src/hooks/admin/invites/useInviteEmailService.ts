
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse } from './types';
import { APP_CONFIG } from '@/config/app';

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

interface EmailServiceStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastError?: string;
  lastSuccess?: Date;
  strategiesUsed: {
    resend_primary: number;
    supabase_auth: number;
    fallback_recovery: number;
  };
}

export function useInviteEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);
  const [stats, setStats] = useState<EmailServiceStats>({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    strategiesUsed: {
      resend_primary: 0,
      supabase_auth: 0,
      fallback_recovery: 0
    }
  });

  const updateStats = (success: boolean, strategy: string, error?: string) => {
    setStats(prev => ({
      ...prev,
      totalCalls: prev.totalCalls + 1,
      successfulCalls: success ? prev.successfulCalls + 1 : prev.successfulCalls,
      failedCalls: success ? prev.failedCalls : prev.failedCalls + 1,
      lastError: error,
      lastSuccess: success ? new Date() : prev.lastSuccess,
      strategiesUsed: {
        ...prev.strategiesUsed,
        [strategy]: (prev.strategiesUsed[strategy] || 0) + 1
      }
    }));
  };

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
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      setIsSending(true);
      setSendError(null);

      console.log(`🚀 [${requestId}] Iniciando envio de convite com sistema robusto:`, { 
        email, 
        roleName, 
        forceResend,
        timestamp: new Date().toISOString(),
        inviteId
      });

      // Validações básicas
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      // ESTRATÉGIA 1: Resend Primary (Mais confiável)
      console.log(`📧 [${requestId}] Tentativa 1: Resend Primary API`);
      
      try {
        const startTime = Date.now();
        
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email,
            inviteUrl,
            roleName,
            expiresAt,
            senderName,
            notes,
            inviteId,
            forceResend,
            requestId,
            strategy: 'resend_primary',
            timestamp: new Date().toISOString()
          }
        });

        const responseTime = Date.now() - startTime;
        console.log(`⏱️ [${requestId}] Resend Primary: ${responseTime}ms`);

        if (error) {
          console.error(`❌ [${requestId}] Erro da Edge Function:`, error);
          throw new Error(`Edge Function Error: ${error.message}`);
        }

        if (!data?.success) {
          console.warn(`⚠️ [${requestId}] Resend Primary falhou:`, data);
          throw new Error(data?.error || 'Resend Primary falhou');
        }

        console.log(`✅ [${requestId}] Resend Primary SUCCESS:`, {
          strategy: data.strategy,
          emailId: data.emailId,
          responseTime
        });

        updateStats(true, 'resend_primary');

        toast.success('Email enviado com sucesso!', {
          description: `Convite enviado para ${email} via sistema principal`
        });

        return {
          success: true,
          message: 'Email enviado via Resend',
          emailId: data.emailId,
          strategy: 'resend_primary',
          method: data.method
        };

      } catch (resendError: any) {
        console.error(`❌ [${requestId}] Resend Primary falhou:`, resendError);
        
        // ESTRATÉGIA 2: Supabase Auth Fallback
        console.log(`🔄 [${requestId}] Tentativa 2: Supabase Auth Fallback`);
        
        try {
          const { data: authData, error: authError } = await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo: inviteUrl
            }
          );

          if (authError) {
            console.error(`❌ [${requestId}] Supabase Auth falhou:`, authError);
            throw new Error(`Supabase Auth Error: ${authError.message}`);
          }

          console.log(`✅ [${requestId}] Supabase Auth SUCCESS`);

          updateStats(true, 'supabase_auth');

          toast.success('Convite enviado via sistema alternativo!', {
            description: `Link de acesso enviado para ${email}`
          });

          return {
            success: true,
            message: 'Email enviado via Supabase Auth',
            strategy: 'supabase_auth',
            method: 'reset_password_redirect'
          };

        } catch (authError: any) {
          console.error(`❌ [${requestId}] Supabase Auth falhou:`, authError);
          
          // ESTRATÉGIA 3: Recovery Fallback (último recurso)
          console.log(`🆘 [${requestId}] Tentativa 3: Recovery Fallback`);
          
          try {
            const { data: recoveryData, error: recoveryError } = await supabase.functions.invoke('send-fallback-notification', {
              body: {
                email,
                inviteUrl,
                roleName,
                type: 'invite_fallback',
                requestId
              }
            });

            if (recoveryError || !recoveryData?.success) {
              throw new Error('Recovery fallback também falhou');
            }

            console.log(`✅ [${requestId}] Recovery Fallback SUCCESS`);

            updateStats(true, 'fallback_recovery');

            toast.warning('Convite criado - Email em fila de envio', {
              description: 'Sistema de recuperação ativado. O email será enviado em breve.',
              duration: 8000
            });

            return {
              success: true,
              message: 'Email em fila de envio via sistema de recuperação',
              strategy: 'fallback_recovery',
              method: 'recovery_queue',
              suggestion: 'Convite foi criado com sucesso. Use o botão "Reenviar" se necessário.'
            };

          } catch (recoveryError: any) {
            console.error(`❌ [${requestId}] Todas as estratégias falharam:`, recoveryError);
            throw new Error('Todas as estratégias de envio falharam');
          }
        }
      }

    } catch (err: any) {
      console.error(`❌ [${requestId}] Erro final no envio:`, err);
      setSendError(err);
      updateStats(false, 'none', err.message);

      // Toast de erro com ação sugerida
      toast.error('Falha no envio de email', {
        description: 'Convite foi criado mas o email não foi enviado. Use "Reenviar" para tentar novamente.',
        duration: 10000,
        action: {
          label: 'Verificar Status',
          onClick: () => {
            console.log('📊 Stats do serviço de email:', stats);
          },
        },
      });

      return {
        success: false,
        message: 'Falha em todas as estratégias de envio',
        error: err.message,
        suggestion: 'Convite criado com sucesso. Use o botão "Reenviar" para tentar novamente.'
      };
    } finally {
      setIsSending(false);
    }
  }, [stats]);

  const getInviteLink = useCallback((token: string) => {
    if (!token?.trim()) {
      console.error("❌ Token vazio");
      return "";
    }

    const cleanToken = token.trim();
    const baseUrl = APP_CONFIG.getAppUrl(`/convite/${encodeURIComponent(cleanToken)}`);
    
    console.log("🔗 Link gerado com domínio correto:", baseUrl);
    return baseUrl;
  }, []);

  const getServiceStats = useCallback(() => stats, [stats]);

  const resetStats = useCallback(() => {
    setStats({
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      strategiesUsed: {
        resend_primary: 0,
        supabase_auth: 0,
        fallback_recovery: 0
      }
    });
  }, []);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    getServiceStats,
    resetStats,
    // Compatibilidade com versões antigas
    pendingEmails: 0,
    retryAllPendingEmails: () => {},
    clearEmailQueue: () => {},
    emailQueue: []
  };
}
