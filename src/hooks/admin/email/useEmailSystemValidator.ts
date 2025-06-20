
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { resendTestService } from '@/services/resendTestService';

interface ValidationStep {
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface ValidationReport {
  overall: 'success' | 'warning' | 'error';
  timestamp: string;
  duration: number;
  results: ValidationStep[];
}

export const useEmailSystemValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);
    const startTime = Date.now();
    const results: ValidationStep[] = [];

    try {
      console.log('🔍 Iniciando validação completa do sistema...');

      // 1. Teste de Edge Functions Deployment
      results.push({
        step: 'Verificação de Edge Functions',
        status: 'pending',
        message: 'Verificando deployment...'
      });

      try {
        const deploymentCheck = await resendTestService.testEdgeFunctionDeployment();
        results[results.length - 1] = {
          step: 'Verificação de Edge Functions',
          status: deploymentCheck.deployed ? 'success' : 'error',
          message: deploymentCheck.deployed 
            ? `${deploymentCheck.functions.length} functions encontradas` 
            : `${deploymentCheck.errors.length} problemas encontrados`,
          details: deploymentCheck
        };
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Verificação de Edge Functions',
          status: 'error',
          message: `Erro no deployment: ${error.message}`
        };
      }

      // 2. Teste de Conectividade Resend
      results.push({
        step: 'Conectividade Resend',
        status: 'pending',
        message: 'Testando API...'
      });

      try {
        const healthCheck = await resendTestService.testHealthWithDirectFetch(1, true);
        results[results.length - 1] = {
          step: 'Conectividade Resend',
          status: healthCheck.healthy ? 'success' : 'error',
          message: healthCheck.healthy 
            ? `Conectado (${healthCheck.responseTime}ms)` 
            : `Falha: ${healthCheck.lastError}`,
          details: healthCheck
        };
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Conectividade Resend',
          status: 'error',
          message: `Erro de conectividade: ${error.message}`
        };
      }

      // 3. Teste de Geração de Link de Convite
      results.push({
        step: 'Geração de Links',
        status: 'pending',
        message: 'Testando geração...'
      });

      try {
        const { data: testInvite } = await supabase
          .from('invites')
          .select('*')
          .limit(1)
          .single();

        if (testInvite) {
          const inviteUrl = `${window.location.origin}/accept-invite/${testInvite.token}`;
          results[results.length - 1] = {
            step: 'Geração de Links',
            status: 'success',
            message: 'Links sendo gerados corretamente',
            details: { sampleUrl: inviteUrl.substring(0, 50) + '...' }
          };
        } else {
          results[results.length - 1] = {
            step: 'Geração de Links',
            status: 'warning',
            message: 'Nenhum convite para testar'
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Geração de Links',
          status: 'error',
          message: `Erro na geração: ${error.message}`
        };
      }

      // 4. Teste de Sistema de Monitoramento
      results.push({
        step: 'Sistema de Monitoramento',
        status: 'pending',
        message: 'Testando monitoramento...'
      });

      try {
        const { data, error } = await supabase.functions.invoke('email-system-monitor', {
          body: { testMode: true }
        });

        if (error) {
          results[results.length - 1] = {
            step: 'Sistema de Monitoramento',
            status: 'error',
            message: `Erro no monitoramento: ${error.message}`
          };
        } else {
          results[results.length - 1] = {
            step: 'Sistema de Monitoramento',
            status: 'success',
            message: 'Monitoramento funcionando',
            details: data
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Sistema de Monitoramento',
          status: 'error',
          message: `Falha no monitoramento: ${error.message}`
        };
      }

      // 5. Verificação da Fila de Emails
      results.push({
        step: 'Fila de Emails',
        status: 'pending',
        message: 'Verificando fila...'
      });

      try {
        const { data: queueData, error: queueError } = await supabase
          .from('email_queue')
          .select('*', { count: 'exact' })
          .limit(1);

        if (queueError) {
          results[results.length - 1] = {
            step: 'Fila de Emails',
            status: 'error',
            message: `Erro na fila: ${queueError.message}`
          };
        } else {
          results[results.length - 1] = {
            step: 'Fila de Emails',
            status: 'success',
            message: 'Sistema de fila operacional',
            details: { queueAccessible: true }
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Fila de Emails',
          status: 'error',
          message: `Falha na fila: ${error.message}`
        };
      }

      // Determinar status geral
      const hasErrors = results.some(r => r.status === 'error');
      const hasWarnings = results.some(r => r.status === 'warning');
      const overall = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';

      const duration = Date.now() - startTime;
      const report: ValidationReport = {
        overall,
        timestamp: new Date().toISOString(),
        duration,
        results
      };

      setValidationReport(report);
      console.log('✅ Validação completa concluída:', report);

    } catch (error: any) {
      console.error('❌ Erro na validação:', error);
      
      const duration = Date.now() - startTime;
      setValidationReport({
        overall: 'error',
        timestamp: new Date().toISOString(),
        duration,
        results: [
          ...results,
          {
            step: 'Validação Geral',
            status: 'error',
            message: `Erro crítico: ${error.message}`
          }
        ]
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setValidationReport(null);
  }, []);

  return {
    isValidating,
    validationReport,
    runCompleteValidation,
    clearReport
  };
};
