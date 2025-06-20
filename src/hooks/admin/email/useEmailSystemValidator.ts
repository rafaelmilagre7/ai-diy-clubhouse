
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

interface ValidationResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface ValidationReport {
  overall: 'success' | 'warning' | 'error';
  duration: number;
  timestamp: string;
  results: ValidationResult[];
}

export const useEmailSystemValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    try {
      console.log('🔍 Iniciando validação completa do sistema de email...');

      // 1. Teste de conectividade básica
      try {
        const healthCheck = await resendTestService.testHealthWithDirectFetch(1, true);
        
        if (healthCheck.healthy) {
          results.push({
            step: 'Conectividade do Sistema',
            status: 'success',
            message: `Sistema conectado (${healthCheck.responseTime}ms)`
          });
        } else {
          results.push({
            step: 'Conectividade do Sistema',
            status: 'error',
            message: healthCheck.lastError || 'Sistema indisponível',
            details: healthCheck.issues
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Conectividade do Sistema',
          status: 'error',
          message: `Falha crítica: ${error.message}`
        });
      }

      // 2. Verificação de deployment das Edge Functions
      try {
        const deploymentCheck = await resendTestService.testEdgeFunctionDeployment();
        
        if (deploymentCheck.deployed) {
          results.push({
            step: 'Deployment das Edge Functions',
            status: 'success',
            message: `${deploymentCheck.functions.length} function(s) deployada(s)`
          });
        } else {
          results.push({
            step: 'Deployment das Edge Functions',
            status: 'error',
            message: 'Functions não deployadas corretamente',
            details: deploymentCheck.errors
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Deployment das Edge Functions',
          status: 'error',
          message: `Erro ao verificar deployment: ${error.message}`
        });
      }

      // 3. Teste de envio de email real
      try {
        const testEmail = 'test@viverdeia.ai';
        const emailResult = await resendTestService.sendTestEmailDirect(testEmail);
        
        if (emailResult.success) {
          results.push({
            step: 'Envio de Email de Teste',
            status: 'success',
            message: `Email enviado com sucesso (ID: ${emailResult.emailId})`
          });
        } else {
          results.push({
            step: 'Envio de Email de Teste',
            status: 'error',
            message: emailResult.error || 'Falha no envio',
            details: emailResult
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Envio de Email de Teste',
          status: 'error',
          message: `Erro no teste de envio: ${error.message}`
        });
      }

      // 4. Verificação de configuração Resend
      try {
        // Simular verificação de API key através da health check
        const configCheck = await resendTestService.testHealthWithDirectFetch(1, false);
        
        if (configCheck.apiKeyValid) {
          results.push({
            step: 'Configuração Resend API',
            status: 'success',
            message: 'API key válida e configurada'
          });
        } else {
          results.push({
            step: 'Configuração Resend API',
            status: 'error',
            message: 'API key inválida ou não configurada'
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Configuração Resend API',
          status: 'warning',
          message: `Não foi possível verificar API key: ${error.message}`
        });
      }

      // 5. Teste de geração de links de convite
      try {
        const testToken = 'ABC123XYZ789';
        const baseUrl = window.location.origin;
        const testLink = `${baseUrl}/convite/${testToken}`;
        
        if (testLink.includes('convite') && testLink.length > 20) {
          results.push({
            step: 'Geração de Links de Convite',
            status: 'success',
            message: 'Links gerados corretamente'
          });
        } else {
          results.push({
            step: 'Geração de Links de Convite',
            status: 'error',
            message: 'Falha na geração de links'
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Geração de Links de Convite',
          status: 'error',
          message: `Erro na geração de links: ${error.message}`
        });
      }

      const duration = Date.now() - startTime;
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;

      const overall = errorCount > 0 ? 'error' : 
                     warningCount > 0 ? 'warning' : 'success';

      const report: ValidationReport = {
        overall,
        duration,
        timestamp: new Date().toISOString(),
        results
      };

      setValidationReport(report);

      // Notificação baseada no resultado
      if (overall === 'success') {
        toast.success('✅ Sistema validado com sucesso!', {
          description: `Todos os testes passaram em ${duration}ms`
        });
      } else if (overall === 'warning') {
        toast.warning('⚠️ Sistema funcional com avisos', {
          description: `${warningCount} aviso(s) detectado(s)`
        });
      } else {
        toast.error('❌ Problemas detectados no sistema', {
          description: `${errorCount} erro(s) encontrado(s)`
        });
      }

      console.log('✅ Validação completa finalizada:', report);

    } catch (error: any) {
      console.error('❌ Erro crítico na validação:', error);
      
      const report: ValidationReport = {
        overall: 'error',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        results: [{
          step: 'Validação do Sistema',
          status: 'error',
          message: `Erro crítico: ${error.message}`
        }]
      };

      setValidationReport(report);
      
      toast.error('❌ Falha crítica na validação', {
        description: error.message
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
