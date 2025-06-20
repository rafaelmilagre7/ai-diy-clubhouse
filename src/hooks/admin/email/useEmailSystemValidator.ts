
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ValidationStep {
  step: string;
  status: 'success' | 'error' | 'pending' | 'warning';
  message: string;
  details?: any;
}

interface ValidationReport {
  overall: 'success' | 'error' | 'warning' | 'pending';
  results: ValidationStep[];
  timestamp: string;
  duration: number;
}

export const useEmailSystemValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);
    const startTime = Date.now();
    const validationId = crypto.randomUUID().substring(0, 8);
    
    console.log(`🔍 [${validationId}] Iniciando validação completa do sistema`);
    
    const results: ValidationStep[] = [];
    
    try {
      // 1. Teste de configuração do Resend
      console.log(`🔍 [${validationId}] Testando configuração do Resend...`);
      results.push({
        step: 'Configuração Resend',
        status: 'pending',
        message: 'Verificando...'
      });

      const { data: resendTest, error: resendError } = await supabase.functions.invoke('test-resend-health', {
        body: { testType: 'config_check', validationId }
      });

      if (resendError || !resendTest?.success) {
        results[results.length - 1] = {
          step: 'Configuração Resend',
          status: 'error',
          message: resendError?.message || 'Falha na configuração',
          details: resendTest
        };
      } else {
        results[results.length - 1] = {
          step: 'Configuração Resend',
          status: 'success',
          message: 'Configuração OK',
          details: resendTest
        };
      }

      // 2. Teste de geração de link
      console.log(`🔍 [${validationId}] Testando geração de links...`);
      results.push({
        step: 'Geração de Links',
        status: 'pending',
        message: 'Verificando...'
      });

      try {
        const testToken = crypto.randomUUID();
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/convite/${testToken}`;
        
        if (inviteUrl.includes('localhost') || inviteUrl.includes('lovable.app')) {
          results[results.length - 1] = {
            step: 'Geração de Links',
            status: 'success',
            message: 'Links gerados corretamente',
            details: { testUrl: inviteUrl }
          };
        } else {
          results[results.length - 1] = {
            step: 'Geração de Links',
            status: 'warning',
            message: 'URL de domínio customizado detectada',
            details: { testUrl: inviteUrl }
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Geração de Links',
          status: 'error',
          message: `Erro na geração: ${error.message}`,
          details: error
        };
      }

      // 3. Teste de template
      console.log(`🔍 [${validationId}] Testando template de email...`);
      results.push({
        step: 'Template de Email',
        status: 'pending',
        message: 'Verificando...'
      });

      const { data: templateTest, error: templateError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: 'test@validation.com',
          inviteUrl: 'https://test.com/invite/123',
          roleName: 'Teste',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          validationMode: true,
          validationId
        }
      });

      if (templateError || !templateTest?.success) {
        results[results.length - 1] = {
          step: 'Template de Email',
          status: 'error',
          message: templateError?.message || 'Falha no template',
          details: templateTest && 'details' in templateTest ? templateTest.details : undefined
        };
      } else {
        results[results.length - 1] = {
          step: 'Template de Email',
          status: 'success',
          message: 'Template renderizado com sucesso',
          details: templateTest && 'details' in templateTest ? templateTest.details : undefined
        };
      }

      // 4. Teste de fallback
      console.log(`🔍 [${validationId}] Testando sistema de fallback...`);
      results.push({
        step: 'Sistema de Fallback',
        status: 'pending',
        message: 'Verificando...'
      });

      const { data: fallbackTest, error: fallbackError } = await supabase.functions.invoke('send-fallback-notification', {
        body: {
          email: 'test@validation.com',
          inviteUrl: 'https://test.com/invite/123',
          roleName: 'Teste',
          type: 'validation_test',
          validationMode: true,
          validationId
        }
      });

      if (fallbackError || !fallbackTest?.success) {
        results[results.length - 1] = {
          step: 'Sistema de Fallback',
          status: 'warning',
          message: 'Fallback com problemas (não crítico)',
          details: fallbackTest
        };
      } else {
        results[results.length - 1] = {
          step: 'Sistema de Fallback',
          status: 'success',
          message: 'Fallback funcionando',
          details: fallbackTest
        };
      }

      // 5. Teste de performance
      console.log(`🔍 [${validationId}] Testando performance...`);
      results.push({
        step: 'Performance',
        status: 'pending',
        message: 'Verificando...'
      });

      const perfStart = Date.now();
      const { error: perfError } = await supabase.functions.invoke('test-resend-health', {
        body: { testType: 'performance_check', validationId }
      });
      const perfDuration = Date.now() - perfStart;

      if (perfError) {
        results[results.length - 1] = {
          step: 'Performance',
          status: 'error',
          message: `Erro no teste: ${perfError.message}`,
          details: { duration: perfDuration }
        };
      } else if (perfDuration > 10000) {
        results[results.length - 1] = {
          step: 'Performance',
          status: 'warning',
          message: `Lentidão detectada: ${perfDuration}ms`,
          details: { duration: perfDuration }
        };
      } else {
        results[results.length - 1] = {
          step: 'Performance',
          status: 'success',
          message: `Performance OK: ${perfDuration}ms`,
          details: { duration: perfDuration }
        };
      }

      // Determinar status geral
      const hasErrors = results.some(r => r.status === 'error');
      const hasWarnings = results.some(r => r.status === 'warning');
      
      let overall: 'success' | 'error' | 'warning' | 'pending';
      if (hasErrors) {
        overall = 'error';
      } else if (hasWarnings) {
        overall = 'warning';
      } else {
        overall = 'success';
      }

      const report: ValidationReport = {
        overall,
        results,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };

      setValidationReport(report);

      // Toast com resultado
      if (overall === 'success') {
        toast.success('✅ Sistema totalmente operacional');
      } else if (overall === 'warning') {
        toast.warning('⚠️ Sistema operacional com avisos');
      } else {
        toast.error('❌ Problemas críticos detectados');
      }

      console.log(`✅ [${validationId}] Validação concluída:`, {
        overall,
        duration: Date.now() - startTime,
        errors: results.filter(r => r.status === 'error').length,
        warnings: results.filter(r => r.status === 'warning').length
      });

    } catch (error: any) {
      console.error(`❌ [${validationId}] Erro crítico na validação:`, error);
      
      const errorReport: ValidationReport = {
        overall: 'error',
        results: [
          ...results,
          {
            step: 'Validação Crítica',
            status: 'error',
            message: `Erro crítico: ${error.message}`,
            details: error
          }
        ],
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };

      setValidationReport(errorReport);
      toast.error('❌ Erro crítico na validação do sistema');
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setValidationReport(null);
    toast.info('Relatório de validação limpo');
  }, []);

  return {
    isValidating,
    validationReport,
    runCompleteValidation,
    clearReport
  };
};
