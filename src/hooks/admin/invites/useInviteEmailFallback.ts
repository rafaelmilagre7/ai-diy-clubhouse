
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/config/app';

interface FallbackEmailResult {
  success: boolean;
  method: 'edge_function' | 'supabase_auth' | 'failed';
  message: string;
  error?: string;
}

export function useInviteEmailFallback() {
  const [isSending, setIsSending] = useState(false);

  const sendInviteWithFallback = async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
  }: {
    email: string;
    inviteUrl: string;
    roleName: string;
    expiresAt: string;
    senderName?: string;
    notes?: string;
    inviteId?: string;
  }): Promise<FallbackEmailResult> => {
    setIsSending(true);
    
    try {
      console.log('🚀 [FALLBACK] Tentando envio de convite para:', email);
      
      // Estratégia 1: Tentar Edge Function (com timeout curto)
      try {
        console.log('📧 [FALLBACK] Tentativa 1: Edge Function...');
        
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
              forceResend: true
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Edge Function timeout')), 5000)
          )
        ]) as any;

        if (!error && data?.success) {
          console.log('✅ [FALLBACK] Edge Function funcionou!');
          return {
            success: true,
            method: 'edge_function',
            message: 'Convite enviado via sistema principal'
          };
        }
        
        throw new Error(error?.message || data?.error || 'Edge Function falhou');
        
      } catch (edgeFunctionError) {
        console.log('⚠️ [FALLBACK] Edge Function falhou:', edgeFunctionError);
        
        // Estratégia 2: Usar Supabase Auth para enviar link de recuperação
        console.log('📧 [FALLBACK] Tentativa 2: Supabase Auth...');
        
        try {
          // Tentar criar usuário temporário ou enviar link de recuperação
          const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: inviteUrl,
            data: {
              role: roleName,
              invite_notes: notes,
              invited_by: senderName
            }
          });

          if (authError) {
            // Se falhar, tentar resetPassword como alternativa
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: inviteUrl
            });
            
            if (resetError) {
              throw new Error(`Auth fallback falhou: ${resetError.message}`);
            }
          }

          console.log('✅ [FALLBACK] Supabase Auth funcionou!');
          return {
            success: true,
            method: 'supabase_auth',
            message: 'Convite enviado via sistema de backup (email pode estar em inglês)'
          };
          
        } catch (authError) {
          console.error('❌ [FALLBACK] Supabase Auth também falhou:', authError);
          
          // Estratégia 3: Salvar para reenvio posterior
          console.log('💾 [FALLBACK] Salvando para reenvio posterior...');
          
          // Registrar tentativa falhada na base de dados
          try {
            await supabase.from('invite_send_attempts').insert({
              invite_id: inviteId,
              email,
              method_attempted: 'fallback_failed',
              error_message: `Edge Function: ${edgeFunctionError.message}, Auth: ${authError.message}`,
              retry_after: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
            });
          } catch (dbError) {
            console.error('Erro ao salvar tentativa:', dbError);
          }

          return {
            success: false,
            method: 'failed',
            message: 'Falha em todos os métodos de envio',
            error: `Sistema de email indisponível. Tentativas: Edge Function (${edgeFunctionError.message}), Supabase Auth (${authError.message})`
          };
        }
      }
      
    } catch (error: any) {
      console.error('❌ [FALLBACK] Erro crítico:', error);
      return {
        success: false,
        method: 'failed',
        message: 'Erro crítico no sistema de envio',
        error: error.message
      };
    } finally {
      setIsSending(false);
    }
  };

  const retryFailedInvites = async () => {
    try {
      console.log('🔄 [FALLBACK] Tentando reenviar convites falhados...');
      
      // Buscar convites que falharam e podem ser reenviados
      const { data: failedAttempts, error } = await supabase
        .from('invite_send_attempts')
        .select(`
          *,
          invites (*)
        `)
        .eq('status', 'failed')
        .lt('retry_after', new Date().toISOString())
        .limit(5);

      if (error || !failedAttempts?.length) {
        console.log('📭 [FALLBACK] Nenhum convite para reenviar');
        return;
      }

      let successCount = 0;
      
      for (const attempt of failedAttempts) {
        const invite = attempt.invites;
        if (!invite) continue;
        
        const inviteUrl = `${window.location.origin}/convite/${invite.token}`;
        
        const result = await sendInviteWithFallback({
          email: invite.email,
          inviteUrl,
          roleName: 'membro', // Fallback padrão
          expiresAt: invite.expires_at,
          inviteId: invite.id
        });
        
        if (result.success) {
          successCount++;
          // Marcar como enviado
          await supabase
            .from('invite_send_attempts')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', attempt.id);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} convite(s) reenviado(s) com sucesso!`);
      }
      
    } catch (error) {
      console.error('❌ [FALLBACK] Erro no reenvio:', error);
    }
  };

  return {
    sendInviteWithFallback,
    retryFailedInvites,
    isSending
  };
}
