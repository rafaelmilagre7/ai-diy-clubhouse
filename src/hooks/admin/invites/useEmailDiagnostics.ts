
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  responseTime?: number;
}

export interface EmailSystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: DiagnosticResult[];
  lastCheck: Date;
  suggestions: string[];
}

export const useEmailDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [health, setHealth] = useState<EmailSystemHealth>({
    overall: 'healthy',
    components: [],
    lastCheck: new Date(),
    suggestions: []
  });

  const runDiagnostics = useCallback(async (): Promise<EmailSystemHealth> => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];
    const suggestions: string[] = [];

    try {
      console.log('🔍 Iniciando diagnóstico completo do sistema de email...');

      // 1. Testar Edge Function de convites
      console.log('📧 Testando Edge Function send-invite-email...');
      const inviteTestStart = Date.now();
      
      try {
        const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'Test',
            expiresAt: new Date().toISOString(),
            requestId: 'diagnostic-test',
            strategy: 'test_mode'
          }
        });

        const inviteTime = Date.now() - inviteTestStart;

        if (inviteError || !inviteData) {
          results.push({
            component: 'Edge Function (send-invite-email)',
            status: 'error',
            message: `Falha na comunicação: ${inviteError?.message || 'Sem resposta'}`,
            responseTime: inviteTime
          });
          suggestions.push('Verificar logs da Edge Function send-invite-email');
        } else {
          results.push({
            component: 'Edge Function (send-invite-email)',
            status: 'success',
            message: 'Comunicação funcionando',
            responseTime: inviteTime,
            details: inviteData
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Edge Function (send-invite-email)',
          status: 'error',
          message: `Erro de rede: ${error.message}`,
          responseTime: Date.now() - inviteTestStart
        });
        suggestions.push('Verificar conectividade com Supabase Edge Functions');
      }

      // 2. Testar Edge Function de fallback
      console.log('🆘 Testando Edge Function send-fallback-notification...');
      const fallbackTestStart = Date.now();
      
      try {
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('send-fallback-notification', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'Test',
            type: 'system_notification',
            requestId: 'diagnostic-test'
          }
        });

        const fallbackTime = Date.now() - fallbackTestStart;

        if (fallbackError || !fallbackData?.success) {
          results.push({
            component: 'Edge Function (send-fallback-notification)',
            status: 'warning',
            message: `Sistema de fallback com problemas: ${fallbackError?.message || 'Falha na resposta'}`,
            responseTime: fallbackTime
          });
          suggestions.push('Sistema de fallback pode estar indisponível');
        } else {
          results.push({
            component: 'Edge Function (send-fallback-notification)',
            status: 'success',
            message: 'Sistema de fallback operacional',
            responseTime: fallbackTime
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Edge Function (send-fallback-notification)',
          status: 'warning',
          message: `Fallback indisponível: ${error.message}`,
          responseTime: Date.now() - fallbackTestStart
        });
      }

      // 3. Testar Supabase Auth
      console.log('🔑 Testando Supabase Auth...');
      const authTestStart = Date.now();
      
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        const authTime = Date.now() - authTestStart;

        if (authError) {
          results.push({
            component: 'Supabase Auth',
            status: 'warning',
            message: `Problema de autenticação: ${authError.message}`,
            responseTime: authTime
          });
          suggestions.push('Verificar configuração de autenticação');
        } else {
          results.push({
            component: 'Supabase Auth',
            status: 'success',
            message: 'Sistema de autenticação operacional',
            responseTime: authTime
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Supabase Auth',
          status: 'error',
          message: `Erro crítico: ${error.message}`,
          responseTime: Date.now() - authTestStart
        });
        suggestions.push('Verificar conectividade com Supabase');
      }

      // 4. Testar conectividade geral
      console.log('🌐 Testando conectividade geral...');
      const connectivityStart = Date.now();
      
      try {
        const { data: connectivityData, error: connectivityError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        const connectivityTime = Date.now() - connectivityStart;

        if (connectivityError) {
          results.push({
            component: 'Conectividade Supabase',
            status: 'error',
            message: `Problema de conectividade: ${connectivityError.message}`,
            responseTime: connectivityTime
          });
          suggestions.push('Verificar conexão com internet e configuração do Supabase');
        } else {
          results.push({
            component: 'Conectividade Supabase',
            status: 'success',
            message: 'Conectividade normal',
            responseTime: connectivityTime
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Conectividade Supabase',
          status: 'error',
          message: `Falha de rede: ${error.message}`,
          responseTime: Date.now() - connectivityStart
        });
        suggestions.push('Verificar conexão com internet');
      }

      // Calcular saúde geral
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      let overall: EmailSystemHealth['overall'] = 'healthy';
      if (errorCount > 0) {
        overall = 'critical';
        suggestions.unshift('Sistema com problemas críticos - verificar logs detalhados');
      } else if (warningCount > 0) {
        overall = 'degraded';
        suggestions.unshift('Sistema funcionando com limitações');
      }

      const healthResult: EmailSystemHealth = {
        overall,
        components: results,
        lastCheck: new Date(),
        suggestions
      };

      setHealth(healthResult);
      console.log('✅ Diagnóstico completo:', healthResult);
      
      return healthResult;

    } catch (error: any) {
      console.error('❌ Erro no diagnóstico:', error);
      
      const errorResult: EmailSystemHealth = {
        overall: 'critical',
        components: [{
          component: 'Sistema de Diagnóstico',
          status: 'error',
          message: `Falha geral: ${error.message}`
        }],
        lastCheck: new Date(),
        suggestions: ['Verificar logs do console para mais detalhes']
      };

      setHealth(errorResult);
      return errorResult;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    runDiagnostics,
    isRunning,
    health
  };
};
