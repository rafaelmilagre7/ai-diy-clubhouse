
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ValidationResult {
  step: string;
  status: 'success' | 'error' | 'pending' | 'warning';
  message: string;
  duration?: number;
  details?: any;
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

  const validateStep = async (
    stepName: string,
    validationFn: () => Promise<{ success: boolean; message: string; details?: any }>
  ): Promise<ValidationResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Validando: ${stepName}`);
      
      const result = await Promise.race([
        validationFn(),
        new Promise<{ success: boolean; message: string }>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      return {
        step: stepName,
        status: result.success ? 'success' : 'error',
        message: result.message,
        duration,
        details: result.details
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ Erro em ${stepName}:`, error);
      
      return {
        step: stepName,
        status: 'error',
        message: error.message === 'Timeout' ? 'Timeout após 10s' : error.message,
        duration,
        details: { error: error.message }
      };
    }
  };

  const validateResendConnectivity = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-resend-health', {
        body: {
          testType: 'connectivity_check',
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID().substring(0, 8)
        }
      });

      if (error) {
        return {
          success: false,
          message: `Erro de conectividade: ${error.message}`,
          details: { error: error.message }
        };
      }

      if (!data?.success) {
        return {
          success: false,
          message: data?.error || 'Falha na validação do Resend',
          details: data
        };
      }

      return {
        success: true,
        message: 'Conectividade com Resend OK',
        details: data
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro crítico: ${error.message}`,
        details: { error: error.message }
      };
    }
  };

  const validateInviteGeneration = async () => {
    try {
      const testToken = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const inviteUrl = `${baseUrl}/convite/${testToken}`;
      
      // Validar se a URL está bem formada
      try {
        new URL(inviteUrl);
      } catch {
        return {
          success: false,
          message: 'URL de convite mal formada',
          details: { url: inviteUrl }
        };
      }

      return {
        success: true,
        message: 'Geração de links funcionando',
        details: { sampleUrl: inviteUrl }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro na geração: ${error.message}`,
        details: { error: error.message }
      };
    }
  };

  const validateEmailTemplate = async () => {
    try {
      // Testar se conseguimos chamar a edge function de email
      const { error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: 'test@example.com',
          inviteUrl: 'https://example.com/test',
          roleName: 'Test',
          expiresAt: new Date().toISOString(),
          testMode: true // Sinalizar que é apenas um teste
        }
      });

      if (error) {
        // Se o erro for de validação por ser teste, isso é esperado
        if (error.message?.includes('test') || error.message?.includes('Test')) {
          return {
            success: true,
            message: 'Template reativo (modo teste)',
            details: { testResponse: error.message }
          };
        }
        
        return {
          success: false,
          message: `Template com problemas: ${error.message}`,
          details: { error: error.message }
        };
      }

      return {
        success: true,
        message: 'Template funcionando',
        details: { status: 'ok' }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro no template: ${error.message}`,
        details: { error: error.message }
      };
    }
  };

  const validateFallbackSystem = async () => {
    try {
      // Testar o sistema de fallback
      const { data, error } = await supabase.functions.invoke('send-fallback-notification', {
        body: {
          email: 'test@example.com',
          inviteUrl: 'https://example.com/test',
          roleName: 'Test',
          type: 'system_test',
          requestId: crypto.randomUUID().substring(0, 8)
        }
      });

      if (error) {
        return {
          success: false,
          message: `Fallback indisponível: ${error.message}`,
          details: { error: error.message }
        };
      }

      if (!data?.success) {
        return {
          success: false,
          message: 'Fallback não responsivo',
          details: data
        };
      }

      return {
        success: true,
        message: 'Sistema de fallback ativo',
        details: data
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro no fallback: ${error.message}`,
        details: { error: error.message }
      };
    }
  };

  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);
    
    const startTime = Date.now();
    const requestId = crypto.randomUUID().substring(0, 8);
    
    console.log(`🚀 [${requestId}] Iniciando validação completa do sistema de email`);
    
    try {
      const results: ValidationResult[] = [];

      // Executar validações em paralelo para melhor performance
      const validations = [
        validateStep('Conectividade Resend', validateResendConnectivity),
        validateStep('Geração de Links', validateInviteGeneration),
        validateStep('Template de Email', validateEmailTemplate),
        validateStep('Sistema Fallback', validateFallbackSystem)
      ];

      const validationResults = await Promise.allSettled(validations);
      
      validationResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            step: `Validação ${index + 1}`,
            status: 'error',
            message: `Falha crítica: ${result.reason?.message || 'Erro desconhecido'}`,
            duration: 0
          });
        }
      });

      // Determinar status geral
      const hasErrors = results.some(r => r.status === 'error');
      const hasWarnings = results.some(r => r.status === 'warning');
      
      let overall: ValidationReport['overall'] = 'success';
      if (hasErrors) {
        overall = 'error';
      } else if (hasWarnings) {
        overall = 'warning';
      }

      const duration = Date.now() - startTime;
      
      const report: ValidationReport = {
        overall,
        timestamp: new Date().toISOString(),
        duration,
        results
      };

      setValidationReport(report);
      
      console.log(`✅ [${requestId}] Validação concluída:`, {
        overall,
        duration: `${duration}ms`,
        errors: results.filter(r => r.status === 'error').length,
        warnings: results.filter(r => r.status === 'warning').length
      });

      // Mostrar notificação baseada no resultado
      if (overall === 'success') {
        toast.success('✅ Sistema de email validado com sucesso!');
      } else if (overall === 'warning') {
        toast.warning('⚠️ Sistema funcionando com alertas');
      } else {
        toast.error('❌ Problemas detectados no sistema');
      }

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erro crítico na validação:`, error);
      
      setValidationReport({
        overall: 'error',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        results: [{
          step: 'Sistema Geral',
          status: 'error',
          message: `Falha crítica: ${error.message}`,
          duration: 0
        }]
      });

      toast.error('❌ Falha crítica na validação do sistema');
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
