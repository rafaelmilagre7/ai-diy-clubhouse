
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { SendInviteResponse } from './types';

interface SendInviteEmailParams {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
}

export const useInviteEmailService = () => {
  const [isSending, setIsSending] = useState(false);

  const getInviteLink = useCallback((token: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/invite?token=${token}`;
  }, []);

  const sendInviteEmail = useCallback(async (params: SendInviteEmailParams): Promise<SendInviteResponse> => {
    const requestId = crypto.randomUUID().substring(0, 8);
    
    console.log(`📧 [${requestId}] Iniciando envio de email para:`, params.email);
    
    setIsSending(true);

    try {
      // Dados para envio
      const emailData = {
        email: params.email,
        inviteUrl: params.inviteUrl,
        roleName: params.roleName,
        expiresAt: params.expiresAt,
        notes: params.notes,
        inviteId: params.inviteId,
        requestId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100),
        clientInfo: 'viverdeia-invite-system'
      };

      console.log(`📤 [${requestId}] Dados preparados:`, {
        email: emailData.email,
        roleName: emailData.roleName,
        inviteId: emailData.inviteId
      });

      // Chamada principal com timeout e retry
      let lastError: any = null;
      let attempt = 0;
      const maxAttempts = 3;
      const timeoutMs = 10000; // 10 segundos

      while (attempt < maxAttempts) {
        attempt++;
        console.log(`🔄 [${requestId}] Tentativa ${attempt}/${maxAttempts}...`);

        try {
          // Criar uma Promise com timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout na requisição')), timeoutMs);
          });

          // Chamada principal
          const invitePromise = supabase.functions.invoke('send-invite-email', {
            body: {
              ...emailData,
              attempt,
              retryInfo: attempt > 1 ? { previousAttempts: attempt - 1 } : undefined
            }
          });

          // Race entre timeout e chamada
          const { data, error } = await Promise.race([
            invitePromise,
            timeoutPromise
          ]) as any;

          if (error) {
            console.warn(`⚠️ [${requestId}] Tentativa ${attempt} falhou:`, error.message);
            lastError = error;
            
            // Se é erro de timeout ou rede, tentar novamente
            if (attempt < maxAttempts && (
              error.message.includes('timeout') || 
              error.message.includes('network') ||
              error.message.includes('fetch')
            )) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              console.log(`⏱️ [${requestId}] Aguardando ${delay}ms antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            // Erro não recuperável
            break;
          }

          if (data?.success) {
            console.log(`✅ [${requestId}] Email enviado com sucesso na tentativa ${attempt}:`, {
              emailId: data.emailId,
              responseTime: data.responseTime
            });

            return {
              success: true,
              message: `Email enviado com sucesso para ${params.email}`,
              emailId: data.emailId,
              strategy: 'resend_primary',
              method: 'edge_function',
              channel: 'email'
            };
          } else {
            console.warn(`⚠️ [${requestId}] Resposta sem sucesso na tentativa ${attempt}:`, data);
            lastError = new Error(data?.error || 'Resposta inválida do servidor');
            
            if (attempt < maxAttempts) {
              const delay = 1000 * attempt;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            break;
          }

        } catch (error: any) {
          console.error(`❌ [${requestId}] Erro na tentativa ${attempt}:`, error);
          lastError = error;
          
          if (attempt < maxAttempts) {
            const delay = 1000 * attempt;
            console.log(`⏱️ [${requestId}] Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          break;
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      console.error(`❌ [${requestId}] Todas as tentativas falharam. Tentando fallback...`);

      // Tentar sistema de fallback
      try {
        console.log(`🆘 [${requestId}] Ativando sistema de fallback...`);
        
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('send-fallback-notification', {
          body: {
            email: params.email,
            inviteUrl: params.inviteUrl,
            roleName: params.roleName,
            type: 'invite_fallback',
            requestId
          }
        });

        if (fallbackError || !fallbackData?.success) {
          console.error(`❌ [${requestId}] Fallback também falhou:`, fallbackError?.message || 'Resposta inválida');
        } else {
          console.log(`✅ [${requestId}] Fallback registrado com sucesso:`, fallbackData);
          
          return {
            success: false,
            message: 'Email principal falhou, mas foi registrado para reenvio automático',
            error: lastError?.message || 'Falha no envio principal',
            strategy: 'fallback_queue',
            suggestion: 'O email será enviado automaticamente assim que o sistema se recuperar'
          };
        }
      } catch (fallbackError: any) {
        console.error(`❌ [${requestId}] Erro crítico no fallback:`, fallbackError);
      }

      // Fallback final: usar Auth do Supabase
      try {
        console.log(`🔐 [${requestId}] Tentando fallback via Supabase Auth...`);
        
        // Isso vai usar o template padrão do Supabase
        const { error: authError } = await supabase.auth.admin.inviteUserByEmail(params.email, {
          data: {
            role_name: params.roleName,
            invite_url: params.inviteUrl,
            notes: params.notes,
            original_invite_id: params.inviteId
          }
        });

        if (authError) {
          console.error(`❌ [${requestId}] Auth fallback falhou:`, authError.message);
        } else {
          console.log(`✅ [${requestId}] Auth fallback funcionou`);
          
          return {
            success: true,
            message: 'Email enviado via sistema de backup',
            strategy: 'supabase_auth',
            suggestion: 'Email enviado com template básico. Sistema principal será corrigido em breve.'
          };
        }
      } catch (authError: any) {
        console.error(`❌ [${requestId}] Erro no auth fallback:`, authError);
      }

      // Se chegou aqui, tudo falhou
      console.error(`💥 [${requestId}] Todos os sistemas de envio falharam`);
      
      return {
        success: false,
        message: 'Falha completa no envio de email',
        error: lastError?.message || 'Sistema de email indisponível',
        strategy: 'none',
        suggestion: 'Verificar configuração do sistema de email e tentar novamente'
      };

    } catch (error: any) {
      console.error(`💥 [${requestId}] Erro crítico não capturado:`, error);
      
      return {
        success: false,
        message: 'Erro inesperado no sistema de email',
        error: error.message,
        suggestion: 'Contatar suporte técnico'
      };
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending
  };
};
