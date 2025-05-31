
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { useAuth } from '@/contexts/auth';
import { useRateLimiting } from './security/useRateLimiting';
import { useIntegrityCheck } from './security/useIntegrityCheck';
import { useBackupSystem } from './security/useBackupSystem';
import { useAuditLog } from './security/useAuditLog';
import { toast } from 'sonner';

interface SecureCompletionResult {
  success: boolean;
  data?: any;
  error?: string;
  wasAlreadyCompleted?: boolean;
  backupId?: string;
  integrityCheck?: any;
  transactionId?: string;
}

export const useSecureOnboardingCompletion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { checkRateLimit } = useRateLimiting();
  const { checkIntegrity } = useIntegrityCheck();
  const { createBackup } = useBackupSystem();
  const { logAction } = useAuditLog();

  const completeOnboardingSecure = useCallback(async (data: OnboardingFinalData): Promise<SecureCompletionResult> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSubmitting(true);

    try {
      console.log('🛡️ Iniciando finalização segura do onboarding');

      // 1. Verificar rate limiting
      console.log('🔍 Verificando rate limiting...');
      const rateLimitResult = await checkRateLimit(user.id);
      
      if (!rateLimitResult.allowed) {
        await logAction(user.id, {
          actionType: 'completion_blocked_rate_limit',
          errorDetails: `Rate limit: ${rateLimitResult.reason}`
        });
        
        return {
          success: false,
          error: 'rate_limited',
          ...rateLimitResult
        };
      }

      // 2. Criar backup pre-completion
      console.log('💾 Criando backup de segurança...');
      const backupId = await createBackup(user.id, 'pre_completion');

      // 3. Verificar integridade antes da submissão
      console.log('🔍 Verificando integridade dos dados...');
      const integrityCheck = await checkIntegrity(user.id);

      // 4. Usar a função segura do banco de dados
      console.log('💾 Salvando onboarding com proteções avançadas...');
      
      const { data: result, error } = await supabase.rpc('complete_onboarding_secure', {
        p_user_id: user.id,
        p_onboarding_data: data,
        p_ip_address: 'client_app',
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('❌ Erro na função segura:', error);
        
        await logAction(user.id, {
          actionType: 'completion_error',
          errorDetails: error.message,
          dataSnapshot: { backupId, integrityCheck }
        });
        
        throw error;
      }

      const secureResult = result as SecureCompletionResult;
      
      console.log('✅ Onboarding finalizado com segurança:', {
        success: secureResult.success,
        wasAlreadyCompleted: secureResult.wasAlreadyCompleted,
        backupId: secureResult.backupId,
        transactionId: secureResult.transactionId
      });

      // 5. Verificação final de integridade
      if (secureResult.success && !secureResult.wasAlreadyCompleted) {
        console.log('🔍 Verificação final de integridade...');
        const finalIntegrityCheck = await checkIntegrity(user.id);
        
        if (finalIntegrityCheck?.status === 'passed') {
          toast.success('Onboarding finalizado com sucesso!', {
            description: 'Todos os sistemas de segurança verificados ✅'
          });
        }
      }

      // 6. Log de sucesso
      await logAction(user.id, {
        actionType: 'completion_success_secure',
        stepName: 'final_completion',
        dataSnapshot: {
          backupId: secureResult.backupId,
          transactionId: secureResult.transactionId,
          wasAlreadyCompleted: secureResult.wasAlreadyCompleted
        }
      });

      return {
        ...secureResult,
        backupId: backupId || secureResult.backupId,
        integrityCheck
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido na finalização segura';
      
      console.error('❌ Erro na finalização segura do onboarding:', error);
      
      await logAction(user.id, {
        actionType: 'completion_error_secure',
        errorDetails: errorMessage,
        dataSnapshot: { originalData: data }
      });

      // Determinar tipo de erro para mensagem apropriada
      if (errorMessage.includes('rate_limit')) {
        toast.error('Muitas tentativas detectadas', {
          description: 'Aguarde alguns minutos antes de tentar novamente.'
        });
      } else if (errorMessage.includes('duplicate')) {
        toast.warning('Onboarding já foi completado', {
          description: 'Redirecionando para o dashboard...'
        });
      } else {
        toast.error('Erro ao finalizar onboarding', {
          description: 'Tente novamente ou entre em contato com o suporte.'
        });
      }

      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, checkRateLimit, checkIntegrity, createBackup, logAction]);

  return {
    completeOnboardingSecure,
    isSubmitting
  };
};
