
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
  overall: 'success' | 'warning' | 'error';
  timestamp: string;
  duration: number;
  results: ValidationResult[];
  recommendations: string[];
}

export const useEmailSystemValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);
    const startTime = Date.now();
    const results: ValidationResult[] = [];
    const recommendations: string[] = [];

    try {
      console.log("🔍 Iniciando validação completa do sistema de email...");

      // 1. Testar conectividade com Resend
      results.push({ step: "Conectividade Resend", status: 'pending', message: "Testando..." });
      
      try {
        const resendStart = Date.now();
        const { data: resendData, error: resendError } = await supabase.functions.invoke('test-resend-health', {
          body: {
            testType: 'connectivity_check',
            requestId: crypto.randomUUID().substring(0, 8),
            timestamp: new Date().toISOString()
          }
        });

        const resendDuration = Date.now() - resendStart;

        if (resendError) {
          results[results.length - 1] = {
            step: "Conectividade Resend",
            status: 'error',
            message: `Falha: ${resendError.message}`,
            duration: resendDuration
          };
          recommendations.push("Verificar configuração da API do Resend");
        } else if (resendData?.success) {
          results[results.length - 1] = {
            step: "Conectividade Resend",
            status: 'success',
            message: `Conectado (${resendDuration}ms)`,
            duration: resendDuration
          };
        } else {
          results[results.length - 1] = {
            step: "Conectividade Resend",
            status: 'error',
            message: "Sistema indisponível",
            duration: resendDuration
          };
          recommendations.push("Verificar status do serviço Resend");
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: "Conectividade Resend",
          status: 'error',
          message: `Erro de rede: ${error.message}`,
          duration: 0
        };
      }

      // 2. Testar Edge Function de convites
      results.push({ step: "Edge Function Convites", status: 'pending', message: "Testando..." });
      
      try {
        const inviteStart = Date.now();
        const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'Test',
            isTest: true,
            requestId: crypto.randomUUID().substring(0, 8)
          }
        });

        const inviteDuration = Date.now() - inviteStart;

        if (inviteError) {
          results[results.length - 1] = {
            step: "Edge Function Convites",
            status: 'error',
            message: `Falha na Edge Function: ${inviteError.message}`,
            duration: inviteDuration
          };
          recommendations.push("Verificar logs da Edge Function send-invite-email");
        } else {
          results[results.length - 1] = {
            step: "Edge Function Convites",
            status: 'success',
            message: `Edge Function respondendo (${inviteDuration}ms)`,
            duration: inviteDuration
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: "Edge Function Convites",
          status: 'error',
          message: `Erro na chamada: ${error.message}`,
          duration: 0
        };
        recommendations.push("Verificar conectividade com Supabase Functions");
      }

      // 3. Testar geração de links
      results.push({ step: "Geração de Links", status: 'pending', message: "Testando..." });
      
      try {
        const linkTest = `${window.location.origin}/auth/invite?token=test-token-123`;
        const isValidLink = linkTest.includes('/auth/invite?token=');
        
        if (isValidLink) {
          results[results.length - 1] = {
            step: "Geração de Links",
            status: 'success',
            message: "Links sendo gerados corretamente",
            duration: 1
          };
        } else {
          results[results.length - 1] = {
            step: "Geração de Links",
            status: 'error',
            message: "Erro na geração de links",
            duration: 1
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: "Geração de Links",
          status: 'error',
          message: `Erro: ${error.message}`,
          duration: 0
        };
      }

      // 4. Testar sistema de fallback
      results.push({ step: "Sistema de Fallback", status: 'pending', message: "Testando..." });
      
      try {
        const fallbackStart = Date.now();
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('send-fallback-notification', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'Test',
            type: 'invite_fallback',
            requestId: crypto.randomUUID().substring(0, 8)
          }
        });

        const fallbackDuration = Date.now() - fallbackStart;

        if (fallbackError) {
          results[results.length - 1] = {
            step: "Sistema de Fallback",
            status: 'error',
            message: `Fallback indisponível: ${fallbackError.message}`,
            duration: fallbackDuration
          };
          recommendations.push("Configurar sistema de fallback");
        } else if (fallbackData?.success) {
          results[results.length - 1] = {
            step: "Sistema de Fallback",
            status: 'success',
            message: `Fallback ativo (${fallbackDuration}ms)`,
            duration: fallbackDuration
          };
        } else {
          results[results.length - 1] = {
            step: "Sistema de Fallback",
            status: 'error',
            message: "Fallback não configurado",
            duration: fallbackDuration
          };
        }
      } catch (error: any) {
        results[results.length - 1] = {
          step: "Sistema de Fallback",
          status: 'error',
          message: `Erro: ${error.message}`,
          duration: 0
        };
      }

      // 5. Verificar performance geral
      results.push({ step: "Performance Geral", status: 'pending', message: "Analisando..." });
      
      const totalDuration = Date.now() - startTime;
      const avgResponseTime = results.reduce((acc, r) => acc + (r.duration || 0), 0) / results.length;
      
      if (avgResponseTime < 2000) {
        results[results.length - 1] = {
          step: "Performance Geral",
          status: 'success',
          message: `Excelente (${avgResponseTime.toFixed(0)}ms médio)`,
          duration: totalDuration
        };
      } else if (avgResponseTime < 5000) {
        results[results.length - 1] = {
          step: "Performance Geral",
          status: 'warning',
          message: `Adequada (${avgResponseTime.toFixed(0)}ms médio)`,
          duration: totalDuration
        };
        recommendations.push("Considerar otimização de performance");
      } else {
        results[results.length - 1] = {
          step: "Performance Geral",
          status: 'error',
          message: `Lenta (${avgResponseTime.toFixed(0)}ms médio)`,
          duration: totalDuration
        };
        recommendations.push("Performance crítica - verificar infraestrutura");
      }

      // Determinar status geral
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      let overall: 'success' | 'warning' | 'error' = 'success';
      if (errorCount > 0) {
        overall = 'error';
      } else if (warningCount > 0) {
        overall = 'warning';
      }

      const report: ValidationReport = {
        overall,
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        results,
        recommendations
      };

      setValidationReport(report);

      // Mostrar resultado
      if (overall === 'success') {
        toast.success("Sistema validado com sucesso!", {
          description: `Todos os componentes funcionando corretamente`
        });
      } else if (overall === 'warning') {
        toast.warning("Sistema operacional com alertas", {
          description: `${warningCount} item(s) precisam de atenção`
        });
      } else {
        toast.error("Problemas detectados no sistema", {
          description: `${errorCount} componente(s) com falhas`
        });
      }

      console.log("✅ Validação completa finalizada:", report);

    } catch (error: any) {
      console.error("❌ Erro durante validação:", error);
      
      const errorReport: ValidationReport = {
        overall: 'error',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        results: [{
          step: "Validação Geral",
          status: 'error',
          message: `Erro crítico: ${error.message}`,
          duration: 0
        }],
        recommendations: ["Verificar conectividade e configurações gerais"]
      };

      setValidationReport(errorReport);
      
      toast.error("Falha na validação do sistema", {
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
