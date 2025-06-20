
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

interface ValidationStep {
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface ValidationReport {
  timestamp: string;
  duration: number;
  overall: 'success' | 'warning' | 'error';
  results: ValidationStep[];
}

export const useEmailSystemValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const validateEdgeFunctionConnectivity = useCallback(async (): Promise<ValidationStep> => {
    try {
      console.log('🔍 Testando conectividade das Edge Functions...');
      
      // Teste 1: Health check básico
      const healthResult = await resendTestService.testHealthWithDirectFetch(1, true);
      
      if (healthResult.healthy) {
        return {
          step: 'Conectividade Edge Functions',
          status: 'success',
          message: `Conectado (${healthResult.responseTime}ms)`,
          details: healthResult
        };
      } else {
        return {
          step: 'Conectividade Edge Functions',
          status: 'error', 
          message: `Falha: ${healthResult.issues?.join(', ') || 'Erro desconhecido'}`,
          details: healthResult
        };
      }
    } catch (error: any) {
      console.error('❌ Erro no teste de conectividade:', error);
      return {
        step: 'Conectividade Edge Functions',
        status: 'error',
        message: `Erro crítico: ${error.message}`,
        details: { error: error.message }
      };
    }
  }, []);

  const validateResendConfiguration = useCallback(async (): Promise<ValidationStep> => {
    try {
      console.log('🔑 Validando configuração do Resend...');
      
      // Teste direto com a API do Resend (bypass Edge Function)
      const directTest = await resendTestService.testResendApiDirect();
      
      if (directTest.connected) {
        return {
          step: 'Configuração Resend',
          status: 'success',
          message: 'API Key válida e conectada',
          details: directTest
        };
      } else {
        return {
          step: 'Configuração Resend',
          status: 'error',
          message: `Erro na API: ${directTest.error}`,
          details: directTest
        };
      }
    } catch (error: any) {
      return {
        step: 'Configuração Resend',
        status: 'error',
        message: `Falha na validação: ${error.message}`,
        details: { error: error.message }
      };
    }
  }, []);

  const validateInviteLinkGeneration = useCallback(async (): Promise<ValidationStep> => {
    try {
      console.log('🔗 Testando geração de links...');
      
      const testToken = 'TEST-TOKEN-' + Date.now();
      const baseUrl = window.location.origin;
      const testLink = `${baseUrl}/convite/${testToken}`;
      
      // Verificar se o domínio é válido
      const isCustomDomain = !baseUrl.includes('lovable.app') && !baseUrl.includes('localhost');
      
      return {
        step: 'Geração de Links',
        status: isCustomDomain ? 'success' : 'warning',
        message: isCustomDomain 
          ? 'URL de domínio customizado detectada' 
          : 'Usando domínio de desenvolvimento',
        details: { 
          baseUrl, 
          testLink, 
          isCustomDomain,
          domain: new URL(baseUrl).hostname
        }
      };
    } catch (error: any) {
      return {
        step: 'Geração de Links',
        status: 'error',
        message: `Erro ao gerar links: ${error.message}`,
        details: { error: error.message }
      };
    }
  }, []);

  const validateEmailTemplate = useCallback(async (): Promise<ValidationStep> => {
    try {
      console.log('📧 Testando template de email...');
      
      // Teste do template através da Edge Function
      const testEmail = 'test@viverdeia.ai';
      const emailResult = await resendTestService.sendTestEmailDirect(testEmail);
      
      if (emailResult.success) {
        return {
          step: 'Template de Email',
          status: 'success',
          message: `Template funcionando (ID: ${emailResult.emailId})`,
          details: emailResult
        };
      } else {
        return {
          step: 'Template de Email',
          status: 'error',
          message: `Falha no template: ${emailResult.error}`,
          details: emailResult
        };
      }
    } catch (error: any) {
      return {
        step: 'Template de Email',
        status: 'error',
        message: `Erro no teste: ${error.message}`,
        details: { error: error.message }
      };
    }
  }, []);

  const validateFallbackSystem = useCallback(async (): Promise<ValidationStep> => {
    try {
      console.log('🆘 Testando sistema de fallback...');
      
      // Simular falha e testar fallback
      const { data, error } = await supabase.functions.invoke('send-fallback-notification', {
        body: {
          email: 'test@viverdeia.ai',
          inviteUrl: 'https://test.com/invite',
          roleName: 'Test',
          type: 'system_test',
          requestId: 'validation-test-' + Date.now()
        }
      });

      if (!error && data?.success) {
        return {
          step: 'Sistema de Fallback',
          status: 'success',
          message: 'Sistema de recuperação operacional',
          details: data
        };
      } else {
        return {
          step: 'Sistema de Fallback',
          status: 'warning',
          message: 'Fallback com problemas (não crítico)',
          details: { error: error?.message, data }
        };
      }
    } catch (error: any) {
      return {
        step: 'Sistema de Fallback',
        status: 'warning',
        message: `Fallback indisponível: ${error.message}`,
        details: { error: error.message }
      };
    }
  }, []);

  const validatePerformance = useCallback(async (): Promise<ValidationStep> => {
    try {
      console.log('⚡ Testando performance...');
      
      const startTime = Date.now();
      
      // Teste de performance com múltiplas chamadas
      const healthTest = await resendTestService.testHealthWithDirectFetch(1);
      const responseTime = Date.now() - startTime;
      
      let status: 'success' | 'warning' | 'error' = 'success';
      let message = '';
      
      if (responseTime < 1000) {
        status = 'success';
        message = `Excelente (${responseTime}ms)`;
      } else if (responseTime < 3000) {
        status = 'warning';
        message = `Aceitável (${responseTime}ms)`;
      } else {
        status = 'error';
        message = `Lento (${responseTime}ms)`;
      }
      
      return {
        step: 'Performance',
        status,
        message,
        details: { responseTime, healthTest }
      };
    } catch (error: any) {
      return {
        step: 'Performance',
        status: 'error',
        message: `Erro no teste: ${error.message}`,
        details: { error: error.message }
      };
    }
  }, []);

  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);
    const startTime = Date.now();
    
    try {
      console.log('🚀 Iniciando validação completa do sistema...');
      toast.info('🔍 Executando validação completa...', { 
        description: 'Isso pode levar alguns segundos' 
      });

      const results: ValidationStep[] = [];
      
      // Executar todas as validações em paralelo para melhor performance
      const [
        edgeFunctionResult,
        resendResult,
        linkResult,
        templateResult,
        fallbackResult,
        performanceResult
      ] = await Promise.allSettled([
        validateEdgeFunctionConnectivity(),
        validateResendConfiguration(), 
        validateInviteLinkGeneration(),
        validateEmailTemplate(),
        validateFallbackSystem(),
        validatePerformance()
      ]);

      // Processar resultados
      [
        edgeFunctionResult,
        resendResult, 
        linkResult,
        templateResult,
        fallbackResult,
        performanceResult
      ].forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            step: 'Teste com erro',
            status: 'error',
            message: `Falha: ${result.reason?.message || 'Erro desconhecido'}`,
            details: { error: result.reason }
          });
        }
      });

      const duration = Date.now() - startTime;
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      let overall: 'success' | 'warning' | 'error';
      if (errorCount > 0) {
        overall = 'error';
      } else if (warningCount > 0) {
        overall = 'warning';
      } else {
        overall = 'success';
      }

      const report: ValidationReport = {
        timestamp: new Date().toISOString(),
        duration,
        overall,
        results
      };

      setValidationReport(report);
      
      // Notificações baseadas no resultado
      if (overall === 'success') {
        toast.success('✅ Sistema totalmente operacional!', {
          description: `Todos os testes passaram em ${duration}ms`
        });
      } else if (overall === 'warning') {
        toast.warning('⚠️ Sistema funcionando com ressalvas', {
          description: `${warningCount} aviso(s) detectado(s)`
        });
      } else {
        toast.error('❌ Problemas críticos detectados', {
          description: `${errorCount} erro(s) que precisam de atenção`
        });
      }

      console.log('📊 Validação completa finalizada:', report);
      
    } catch (error: any) {
      console.error('❌ Erro crítico na validação:', error);
      toast.error('❌ Falha na validação', {
        description: 'Erro inesperado durante os testes'
      });
    } finally {
      setIsValidating(false);
    }
  }, [
    validateEdgeFunctionConnectivity,
    validateResendConfiguration,
    validateInviteLinkGeneration,
    validateEmailTemplate,
    validateFallbackSystem,
    validatePerformance
  ]);

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
