
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DiagnosticData } from './types';

export const useInviteDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticData | null>(null);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  const runDiagnostic = useCallback(async (): Promise<DiagnosticData> => {
    setIsRunning(true);
    
    try {
      console.log("🔍 [DIAGNOSTIC] Iniciando diagnóstico completo...");
      
      const diagnostic: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus: 'healthy',
        resendStatus: 'healthy',
        supabaseStatus: 'healthy',
        edgeFunctionStatus: 'healthy',
        configStatus: 'healthy',
        recentAttempts: [],
        recommendations: [],
        details: {
          resendApiKey: false,
          edgeFunctionVersion: '1.0.0',
          totalAttempts: 0,
          successRate: 0
        }
      };

      // 1. Verificar configuração do Resend
      console.log("🔍 [DIAGNOSTIC] Testando Edge Function...");
      try {
        const { data: testResult, error: testError } = await supabase.functions.invoke('send-invite-email', {
          body: {
            test: true,
            email: 'test@example.com'
          }
        });

        if (testError) {
          console.error("❌ [DIAGNOSTIC] Edge Function error:", testError);
          diagnostic.edgeFunctionStatus = 'critical';
          diagnostic.recommendations.push('Edge Function não está respondendo: ' + testError.message);
        } else if (testResult?.config_check) {
          diagnostic.details.resendApiKey = testResult.config_check.has_resend_key;
          if (!testResult.config_check.has_resend_key) {
            diagnostic.configStatus = 'critical';
            diagnostic.recommendations.push('Configure a chave RESEND_API_KEY no Supabase Edge Functions');
          }
        }
      } catch (error: any) {
        console.error("❌ [DIAGNOSTIC] Edge Function test failed:", error);
        diagnostic.edgeFunctionStatus = 'critical';
        diagnostic.recommendations.push('Edge Function com erro: ' + error.message);
      }

      // 2. Verificar tentativas recentes com query simples
      console.log("🔍 [DIAGNOSTIC] Verificando tentativas recentes...");
      try {
        const { data: attempts, error: attemptsError } = await supabase
          .from('invite_send_attempts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (attemptsError) {
          console.error("❌ [DIAGNOSTIC] Erro ao buscar tentativas:", attemptsError);
          diagnostic.supabaseStatus = 'warning';
          diagnostic.recommendations.push('Problema na conexão com Supabase: ' + attemptsError.message);
        } else {
          diagnostic.recentAttempts = (attempts || []).map(attempt => ({
            id: attempt.id,
            email: attempt.email,
            status: attempt.status,
            method_attempted: attempt.method_attempted,
            created_at: attempt.created_at,
            error_message: attempt.error_message
          }));

          diagnostic.details.totalAttempts = attempts?.length || 0;
          
          if (diagnostic.details.totalAttempts === 0) {
            diagnostic.recommendations.push('Nenhuma tentativa de envio registrada - possível problema na Edge Function');
          } else {
            const successfulAttempts = attempts?.filter(a => a.status === 'sent').length || 0;
            diagnostic.details.successRate = Math.round((successfulAttempts / diagnostic.details.totalAttempts) * 100);
          }
        }
      } catch (error: any) {
        console.error("❌ [DIAGNOSTIC] Erro ao verificar tentativas:", error);
        diagnostic.supabaseStatus = 'critical';
        diagnostic.recommendations.push('Erro na consulta de tentativas: ' + error.message);
      }

      // 3. Verificar status geral do sistema
      const criticalIssues = [
        diagnostic.edgeFunctionStatus === 'critical',
        diagnostic.configStatus === 'critical',
        diagnostic.supabaseStatus === 'critical'
      ].filter(Boolean).length;

      const warningIssues = [
        diagnostic.resendStatus === 'warning',
        diagnostic.supabaseStatus === 'warning'
      ].filter(Boolean).length;

      if (criticalIssues > 0) {
        diagnostic.systemStatus = 'critical';
      } else if (warningIssues > 0) {
        diagnostic.systemStatus = 'warning';
      }

      // Determinar status do Resend baseado na taxa de sucesso
      if (diagnostic.details.successRate === 0 && diagnostic.details.totalAttempts > 0) {
        diagnostic.resendStatus = 'critical';
      } else if (diagnostic.details.successRate < 50) {
        diagnostic.resendStatus = 'warning';
      }

      console.log("✅ [DIAGNOSTIC] Diagnóstico concluído:", diagnostic);
      
      setLastDiagnostic(diagnostic);
      setSystemStatus(diagnostic.systemStatus);
      
      return diagnostic;
    } catch (error: any) {
      console.error("❌ [DIAGNOSTIC] Erro no diagnóstico:", error);
      
      const errorDiagnostic: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus: 'critical',
        resendStatus: 'critical',
        supabaseStatus: 'critical',
        edgeFunctionStatus: 'critical',
        configStatus: 'critical',
        recentAttempts: [],
        recommendations: [`Erro crítico no diagnóstico: ${error.message}`],
        details: {
          resendApiKey: false,
          edgeFunctionVersion: '1.0.0',
          totalAttempts: 0,
          successRate: 0,
          lastError: error.message
        }
      };
      
      setLastDiagnostic(errorDiagnostic);
      setSystemStatus('critical');
      
      return errorDiagnostic;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const testEmailSend = useCallback(async (email: string) => {
    console.log("📧 [DIAGNOSTIC] Testando envio de email para:", email);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl: 'https://example.com/test',
          roleName: 'teste',
          expiresAt: new Date().toISOString(),
          senderName: 'Sistema de Teste',
          notes: 'Este é um teste do sistema de envio de emails',
          test: true
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: data?.success || false,
        message: data?.message || 'Teste realizado',
        error: data?.error
      };
    } catch (error: any) {
      console.error("❌ [DIAGNOSTIC] Erro no teste de email:", error);
      return {
        success: false,
        message: 'Erro no teste de email',
        error: error.message
      };
    }
  }, []);

  return {
    runDiagnostic,
    testEmailSend,
    isRunning,
    lastDiagnostic,
    systemStatus,
    recentAttempts: lastDiagnostic?.recentAttempts || [],
    isLoading: isRunning
  };
};
