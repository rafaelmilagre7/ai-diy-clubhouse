
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RecoveryAttempt {
  id: string;
  email: string;
  inviteUrl: string;
  roleName: string;
  attempts: number;
  lastAttempt: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  method: 'resend' | 'fallback' | 'manual';
  error?: string;
}

export const useEmailEmergencyRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryQueue, setRecoveryQueue] = useState<RecoveryAttempt[]>([]);

  const attemptEmailRecovery = useCallback(async (
    email: string,
    inviteUrl: string,
    roleName: string,
    originalError?: string
  ) => {
    setIsRecovering(true);
    const recoveryId = crypto.randomUUID().substring(0, 8);
    
    console.log(`🆘 [${recoveryId}] Iniciando recuperação de email para:`, email);
    
    try {
      // Primeira tentativa: Resend direto com retry
      console.log(`🔄 [${recoveryId}] Tentativa 1: Resend direto`);
      
      const { data: resendData, error: resendError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          forceResend: true,
          recoveryMode: true,
          recoveryId
        }
      });

      if (!resendError && resendData?.success) {
        console.log(`✅ [${recoveryId}] Recuperação bem-sucedida via Resend`);
        toast.success(`✅ Email recuperado com sucesso para ${email}`);
        return { success: true, method: 'resend', data: resendData };
      }

      // Segunda tentativa: Sistema de fallback
      console.log(`🔄 [${recoveryId}] Tentativa 2: Sistema de fallback`);
      
      const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('send-fallback-notification', {
        body: {
          email,
          inviteUrl,
          roleName,
          type: 'invite_fallback',
          requestId: recoveryId,
          originalError
        }
      });

      if (!fallbackError && fallbackData?.success) {
        console.log(`✅ [${recoveryId}] Recuperação via fallback registrada`);
        toast.warning(`⚠️ Email registrado na fila de recuperação para ${email}`);
        return { success: true, method: 'fallback', data: fallbackData };
      }

      // Terceira tentativa: Fallback via Supabase Auth (último recurso)
      console.log(`🔄 [${recoveryId}] Tentativa 3: Fallback Supabase Auth`);
      
      try {
        // Criar um convite especial usando o sistema de auth do Supabase
        const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: inviteUrl,
          data: {
            role: roleName,
            recovery_mode: true,
            recovery_id: recoveryId
          }
        });

        if (!authError) {
          console.log(`✅ [${recoveryId}] Recuperação via Supabase Auth`);
          toast.success(`✅ Email de recuperação enviado via sistema alternativo para ${email}`);
          return { success: true, method: 'supabase_auth', data: { recoveryId } };
        }
      } catch (authError: any) {
        console.error(`❌ [${recoveryId}] Falha no fallback Supabase Auth:`, authError);
      }

      // Se chegou até aqui, todas as tentativas falharam
      console.error(`❌ [${recoveryId}] Todas as tentativas de recuperação falharam`);
      
      // Registrar na fila para tentativa manual posterior
      const recoveryAttempt: RecoveryAttempt = {
        id: recoveryId,
        email,
        inviteUrl,
        roleName,
        attempts: 3,
        lastAttempt: new Date().toISOString(),
        status: 'failed',
        method: 'manual',
        error: `Resend: ${resendError?.message}, Fallback: ${fallbackError?.message}`
      };

      setRecoveryQueue(prev => [...prev, recoveryAttempt]);
      
      toast.error(`❌ Falha na recuperação para ${email}. Registrado para tentativa manual.`);
      
      return { 
        success: false, 
        method: 'failed', 
        error: 'Todas as tentativas falharam',
        recoveryId 
      };

    } catch (error: any) {
      console.error(`❌ [${recoveryId}] Erro crítico na recuperação:`, error);
      toast.error(`❌ Erro crítico na recuperação para ${email}`);
      
      return { 
        success: false, 
        method: 'error', 
        error: error.message,
        recoveryId 
      };
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const retryRecovery = useCallback(async (recoveryAttempt: RecoveryAttempt) => {
    console.log(`🔄 Retry para:`, recoveryAttempt.email);
    
    return await attemptEmailRecovery(
      recoveryAttempt.email,
      recoveryAttempt.inviteUrl,
      recoveryAttempt.roleName,
      recoveryAttempt.error
    );
  }, [attemptEmailRecovery]);

  const clearRecoveryQueue = useCallback(() => {
    setRecoveryQueue([]);
    toast.info('Fila de recuperação limpa');
  }, []);

  return {
    isRecovering,
    recoveryQueue,
    attemptEmailRecovery,
    retryRecovery,
    clearRecoveryQueue
  };
};
