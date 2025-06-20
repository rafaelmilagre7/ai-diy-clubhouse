
import { useState, useCallback } from 'react';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

interface ValidationStep {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
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
    let hasErrors = false;
    let hasWarnings = false;

    try {
      console.log('🔍 [VALIDATOR] Iniciando validação completa do sistema...');

      // Teste 1: Conectividade com Edge Functions
      console.log('🔍 [VALIDATOR] Teste 1: Conectividade Edge Functions');
      const stepStart = Date.now();
      try {
        const healthResult = await resendTestService.testHealthWithDirectFetch(1, true);
        const stepDuration = Date.now() - stepStart;
        
        if (healthResult.healthy) {
          results.push({
            step: 'Conectividade Edge Functions',
            status: 'success',
            message: `Conectado (${stepDuration}ms)`,
            duration: stepDuration
          });
        } else {
          hasErrors = true;
          results.push({
            step: 'Conectividade Edge Functions',
            status: 'error',
            message: `Falha: ${healthResult.lastError || 'Conexão indisponível'}`,
            duration: stepDuration
          });
        }
      } catch (error: any) {
        hasErrors = true;
        results.push({
          step: 'Conectividade Edge Functions',
          status: 'error',
          message: `Erro crítico: ${error.message}`
        });
      }

      // Teste 2: Validação de Configuração via Edge Function
      console.log('🔍 [VALIDATOR] Teste 2: Configuração Resend via Edge Function');
      const configStart = Date.now();
      try {
        const healthCheck = await resendTestService.testHealthWithDirectFetch(1, false);
        const configDuration = Date.now() - configStart;
        
        if (healthCheck.apiKeyValid && healthCheck.connectivity === 'connected') {
          results.push({
            step: 'Configuração Resend',
            status: 'success',
            message: `API configurada corretamente (${configDuration}ms)`,
            duration: configDuration
          });
        } else if (healthCheck.apiKeyValid && healthCheck.connectivity === 'error') {
          hasWarnings = true;
          results.push({
            step: 'Configuração Resend',
            status: 'error',
            message: `API key válida, mas conectividade instável`,
            duration: configDuration
          });
        } else {
          hasErrors = true;
          results.push({
            step: 'Configuração Resend',
            status: 'error',
            message: `Configuração inválida: ${healthCheck.lastError}`,
            duration: configDuration
          });
        }
      } catch (error: any) {
        hasErrors = true;
        results.push({
          step: 'Configuração Resend',
          status: 'error',
          message: `Erro na validação: ${error.message}`
        });
      }

      // Teste 3: Geração de Links de Convite
      console.log('🔍 [VALIDATOR] Teste 3: Geração de Links');
      const linkStart = Date.now();
      try {
        const testToken = crypto.randomUUID();
        const baseUrl = window.location.origin;
        const testLink = `${baseUrl}/convite/${testToken}`;
        const linkDuration = Date.now() - linkStart;
        
        if (testLink.includes('localhost') || testLink.includes('127.0.0.1')) {
          hasWarnings = true;
          results.push({
            step: 'Geração de Links',
            status: 'success',
            message: `Links locais funcionando (${linkDuration}ms)`,
            duration: linkDuration
          });
        } else {
          results.push({
            step: 'Geração de Links',
            status: 'success',
            message: `URL de domínio customizado detectada (${linkDuration}ms)`,
            duration: linkDuration
          });
        }
      } catch (error: any) {
        hasErrors = true;
        results.push({
          step: 'Geração de Links',
          status: 'error',
          message: `Erro na geração: ${error.message}`
        });
      }

      // Teste 4: Template de Email via Edge Function
      console.log('🔍 [VALIDATOR] Teste 4: Teste de Template');
      const templateStart = Date.now();
      try {
        const testEmail = 'test@example.com';
        const emailResult = await resendTestService.sendTestEmailDirect(testEmail);
        const templateDuration = Date.now() - templateStart;
        
        if (emailResult.success) {
          results.push({
            step: 'Template de Email',
            status: 'success',
            message: `Template funcionando (ID: ${emailResult.emailId}) (${templateDuration}ms)`,
            duration: templateDuration
          });
        } else {
          hasWarnings = true;
          results.push({
            step: 'Template de Email',
            status: 'error',
            message: `Falha no template: ${emailResult.error}`,
            duration: templateDuration
          });
        }
      } catch (error: any) {
        hasWarnings = true;
        results.push({
          step: 'Template de Email',
          status: 'error',
          message: `Erro no teste: ${error.message}`
        });
      }

      // Teste 5: Sistema de Fallback
      console.log('🔍 [VALIDATOR] Teste 5: Sistema de Fallback');
      const fallbackStart = Date.now();
      try {
        // Simular teste de fallback - verificar se as functions de backup existem
        const deploymentTest = await resendTestService.testEdgeFunctionDeployment();
        const fallbackDuration = Date.now() - fallbackStart;
        
        if (deploymentTest.functions.includes('send-fallback-notification')) {
          results.push({
            step: 'Sistema de Fallback',
            status: 'success',
            message: `Fallback disponível (${fallbackDuration}ms)`,
            duration: fallbackDuration
          });
        } else {
          hasWarnings = true;
          results.push({
            step: 'Sistema de Fallback',
            status: 'error',
            message: `Fallback com problemas (não crítico) (${fallbackDuration}ms)`,
            duration: fallbackDuration
          });
        }
      } catch (error: any) {
        hasWarnings = true;
        results.push({
          step: 'Sistema de Fallback',
          status: 'error',
          message: `Fallback indisponível: ${error.message}`
        });
      }

      // Teste 6: Performance Geral
      console.log('🔍 [VALIDATOR] Teste 6: Performance');
      const totalDuration = Date.now() - startTime;
      
      if (totalDuration < 3000) {
        results.push({
          step: 'Performance',
          status: 'success',
          message: `Excelente (${totalDuration}ms)`,
          duration: totalDuration
        });
      } else if (totalDuration < 10000) {
        hasWarnings = true;
        results.push({
          step: 'Performance',
          status: 'success',
          message: `Aceitável (${totalDuration}ms)`,
          duration: totalDuration
        });
      } else {
        hasErrors = true;
        results.push({
          step: 'Performance',
          status: 'error',
          message: `Lenta (${totalDuration}ms)`,
          duration: totalDuration
        });
      }

    } catch (error: any) {
      console.error('🔍 [VALIDATOR] Erro crítico na validação:', error);
      hasErrors = true;
      results.push({
        step: 'Validação Geral',
        status: 'error',
        message: `Erro crítico: ${error.message}`
      });
    }

    const totalDuration = Date.now() - startTime;
    const overall = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';

    const report: ValidationReport = {
      overall,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      results
    };

    setValidationReport(report);
    
    // Mostrar resultado no toast
    if (overall === 'success') {
      toast.success(`✅ Validação concluída: Sistema operacional (${totalDuration}ms)`);
    } else if (overall === 'warning') {
      toast.warning(`⚠️ Validação concluída: Sistema funcional com avisos (${totalDuration}ms)`);
    } else {
      toast.error(`❌ Validação concluída: Problemas detectados (${totalDuration}ms)`);
    }

    console.log('🔍 [VALIDATOR] Validação completa finalizada:', report);
    setIsValidating(false);
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
