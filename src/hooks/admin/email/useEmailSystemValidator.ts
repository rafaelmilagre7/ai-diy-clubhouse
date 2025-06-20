
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ValidationResult {
  step: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
}

interface ValidationReport {
  overall: 'success' | 'warning' | 'error' | 'pending';
  timestamp: string;
  duration: number;
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
      console.log('🔍 [VALIDATOR] Iniciando validação completa do sistema...');

      // 1. Teste de conectividade com Resend
      const connectivityStart = Date.now();
      try {
        const { data: resendTest, error: resendError } = await supabase.functions.invoke('test-resend-health', {
          body: { testType: 'connectivity' }
        });

        const connectivityDuration = Date.now() - connectivityStart;

        if (resendError || !resendTest?.success) {
          results.push({
            step: 'Conectividade Resend',
            status: 'error',
            message: resendError?.message || resendTest?.message || 'Falha na conectividade',
            duration: connectivityDuration
          });
        } else {
          results.push({
            step: 'Conectividade Resend',
            status: 'success',
            message: 'Conectividade OK',
            duration: connectivityDuration
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Conectividade Resend',
          status: 'error',
          message: `Erro de conectividade: ${error.message}`,
          duration: Date.now() - connectivityStart
        });
      }

      // 2. Teste de geração de links
      const linkStart = Date.now();
      try {
        const testToken = crypto.randomUUID();
        const inviteUrl = `${window.location.origin}/invite/${testToken}`;
        
        if (inviteUrl.includes('undefined') || !inviteUrl.startsWith('http')) {
          results.push({
            step: 'Geração de Links',
            status: 'error',
            message: 'URL de convite inválida',
            duration: Date.now() - linkStart
          });
        } else {
          results.push({
            step: 'Geração de Links',
            status: 'success',
            message: 'Links gerados corretamente',
            duration: Date.now() - linkStart
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Geração de Links',
          status: 'error',
          message: `Erro na geração de links: ${error.message}`,
          duration: Date.now() - linkStart
        });
      }

      // 3. Teste de template React Email
      const templateStart = Date.now();
      try {
        const { data: templateTest, error: templateError } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://example.com/invite/test',
            roleName: 'Test Role',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            testMode: true
          }
        });

        const templateDuration = Date.now() - templateStart;

        // Verificar se a resposta tem detalhes ou não
        const hasDetails = templateTest && typeof templateTest === 'object' && 'details' in templateTest;
        const details = hasDetails ? templateTest.details : undefined;

        if (templateError || !templateTest?.success) {
          results.push({
            step: 'Template React Email',
            status: 'error',
            message: templateError?.message || templateTest?.message || 'Falha no template',
            duration: templateDuration
          });
        } else {
          results.push({
            step: 'Template React Email',
            status: 'success',
            message: details ? `Template OK: ${details}` : 'Template processado com sucesso',
            duration: templateDuration
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Template React Email',
          status: 'error',
          message: `Erro no template: ${error.message}`,
          duration: Date.now() - templateStart
        });
      }

      // 4. Teste de fallback
      const fallbackStart = Date.now();
      try {
        const { data: fallbackTest, error: fallbackError } = await supabase.functions.invoke('send-fallback-notification', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://example.com/invite/test',
            roleName: 'Test Role',
            type: 'invite_fallback',
            testMode: true
          }
        });

        const fallbackDuration = Date.now() - fallbackStart;

        if (fallbackError || !fallbackTest?.success) {
          results.push({
            step: 'Sistema de Fallback',
            status: 'error',
            message: fallbackError?.message || fallbackTest?.message || 'Falha no fallback',
            duration: fallbackDuration
          });
        } else {
          results.push({
            step: 'Sistema de Fallback',
            status: 'success',
            message: 'Fallback funcional',
            duration: fallbackDuration
          });
        }
      } catch (error: any) {
        results.push({
          step: 'Sistema de Fallback',
          status: 'error',
          message: `Erro no fallback: ${error.message}`,
          duration: Date.now() - fallbackStart
        });
      }

      // 5. Teste de performance
      const performanceStart = Date.now();
      const avgResponseTime = results
        .filter(r => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;

      if (avgResponseTime > 10000) {
        results.push({
          step: 'Performance',
          status: 'error',
          message: `Tempo de resposta muito alto: ${avgResponseTime}ms`,
          duration: Date.now() - performanceStart
        });
      } else if (avgResponseTime > 5000) {
        results.push({
          step: 'Performance',
          status: 'error',
          message: `Tempo de resposta elevado: ${avgResponseTime}ms`,
          duration: Date.now() - performanceStart
        });
      } else {
        results.push({
          step: 'Performance',
          status: 'success',
          message: `Performance adequada: ${avgResponseTime.toFixed(0)}ms`,
          duration: Date.now() - performanceStart
        });
      }

      // Calcular status geral
      const hasErrors = results.some(r => r.status === 'error');
      const hasWarnings = results.some(r => r.status === 'warning');
      
      let overall: 'success' | 'warning' | 'error' = 'success';
      if (hasErrors) overall = 'error';
      else if (hasWarnings) overall = 'warning';

      const report: ValidationReport = {
        overall,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        results
      };

      setValidationReport(report);
      console.log('✅ [VALIDATOR] Validação completa finalizada:', report);

    } catch (error: any) {
      console.error('❌ [VALIDATOR] Erro crítico na validação:', error);
      
      const errorReport: ValidationReport = {
        overall: 'error',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        results: [{
          step: 'Validação Geral',
          status: 'error',
          message: `Erro crítico: ${error.message}`,
          duration: Date.now() - startTime
        }]
      };
      
      setValidationReport(errorReport);
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
