
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DiagnosticData, InviteSystemDiagnostic, SendInviteResponse } from './types';
import { toast } from 'sonner';

export function useInviteEmailDiagnostic(): InviteSystemDiagnostic {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticData>({
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
  });
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [recentAttempts, setRecentAttempts] = useState<Array<{
    id: string;
    email: string;
    status: string;
    method_attempted: string;
    created_at: string;
    error_message?: string;
  }>>([]);

  const runDiagnostic = useCallback(async (): Promise<DiagnosticData> => {
    setIsRunning(true);
    setIsLoading(true);
    
    try {
      console.log('🔍 [DIAGNOSTIC] Iniciando diagnóstico do sistema de convites...');
      
      // 1. Verificar configuração do Resend
      let resendStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      let resendApiKey = false;
      
      try {
        // Tentar chamar a função para verificar se a API key está configurada
        const { data: testResult } = await supabase.functions.invoke('send-invite-email', {
          body: { test: true }
        });
        
        if (testResult?.error?.includes('RESEND_API_KEY')) {
          resendStatus = 'critical';
          resendApiKey = false;
        } else {
          resendApiKey = true;
        }
      } catch (error) {
        console.warn('⚠️ [DIAGNOSTIC] Erro ao verificar Resend:', error);
        resendStatus = 'warning';
      }

      // 2. Verificar status do Supabase
      let supabaseStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      try {
        const { error } = await supabase.from('invites').select('id').limit(1);
        if (error) {
          supabaseStatus = 'critical';
          console.error('❌ [DIAGNOSTIC] Erro no Supabase:', error);
        }
      } catch (error) {
        supabaseStatus = 'critical';
        console.error('❌ [DIAGNOSTIC] Erro de conexão com Supabase:', error);
      }

      // 3. Verificar Edge Function
      let edgeFunctionStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      try {
        const { error } = await supabase.functions.invoke('send-invite-email', {
          body: { test: true }
        });
        
        if (error) {
          edgeFunctionStatus = 'warning';
          console.warn('⚠️ [DIAGNOSTIC] Edge Function com problemas:', error);
        }
      } catch (error) {
        edgeFunctionStatus = 'critical';
        console.error('❌ [DIAGNOSTIC] Edge Function não disponível:', error);
      }

      // 4. Buscar tentativas recentes
      let attempts: Array<{
        id: string;
        email: string;
        status: string;
        method_attempted: string;
        created_at: string;
        error_message?: string;
      }> = [];
      
      try {
        const { data, error } = await supabase
          .from('invite_send_attempts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.warn('⚠️ [DIAGNOSTIC] Erro ao buscar tentativas:', error);
        } else {
          attempts = data || [];
        }
      } catch (error) {
        console.warn('⚠️ [DIAGNOSTIC] Erro ao acessar tentativas:', error);
      }

      // 5. Calcular estatísticas
      const totalAttempts = attempts.length;
      const successfulAttempts = attempts.filter(a => a.status === 'sent').length;
      const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

      // 6. Determinar status geral do sistema
      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (resendStatus === 'critical' || supabaseStatus === 'critical' || edgeFunctionStatus === 'critical') {
        overallStatus = 'critical';
      } else if (resendStatus === 'warning' || supabaseStatus === 'warning' || edgeFunctionStatus === 'warning' || successRate < 50) {
        overallStatus = 'warning';
      }

      // 7. Gerar recomendações
      const recommendations: string[] = [];
      
      if (!resendApiKey) {
        recommendations.push('Configure a chave da API do Resend');
      }
      
      if (supabaseStatus === 'critical') {
        recommendations.push('Verifique a conexão com o banco de dados');
      }
      
      if (edgeFunctionStatus === 'critical') {
        recommendations.push('Verifique o status das Edge Functions');
      }
      
      if (successRate < 80 && totalAttempts > 5) {
        recommendations.push('Taxa de sucesso baixa - verifique logs de erro');
      }
      
      if (attempts.length === 0) {
        recommendations.push('Execute um teste de envio para verificar o funcionamento');
      }

      const diagnosticData: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus: overallStatus,
        resendStatus,
        supabaseStatus,
        edgeFunctionStatus,
        configStatus: resendApiKey ? 'healthy' : 'critical',
        recentAttempts: attempts,
        recommendations,
        details: {
          resendApiKey,
          edgeFunctionVersion: '2.0.0',
          totalAttempts,
          successRate,
          lastError: attempts.find(a => a.error_message)?.error_message
        }
      };

      setLastDiagnostic(diagnosticData);
      setSystemStatus(overallStatus);
      setRecentAttempts(attempts);
      
      console.log('✅ [DIAGNOSTIC] Diagnóstico concluído:', {
        status: overallStatus,
        successRate: `${successRate.toFixed(1)}%`,
        totalAttempts,
        recommendations: recommendations.length
      });
      
      return diagnosticData;
      
    } catch (error: any) {
      console.error('❌ [DIAGNOSTIC] Erro durante diagnóstico:', error);
      
      const errorDiagnostic: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus: 'critical',
        resendStatus: 'critical',
        supabaseStatus: 'critical',
        edgeFunctionStatus: 'critical',
        configStatus: 'critical',
        recentAttempts: [],
        recommendations: ['Erro crítico durante diagnóstico - verifique logs'],
        details: {
          resendApiKey: false,
          edgeFunctionVersion: '2.0.0',
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
      setIsLoading(false);
    }
  }, []);

  const testEmailSend = useCallback(async (email: string): Promise<SendInviteResponse> => {
    setIsLoading(true);
    
    try {
      console.log('🧪 [TEST-EMAIL] Testando envio para:', email);
      
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl: 'https://app.example.com/invite/test-token',
          roleName: 'Teste',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Teste',
          notes: 'Este é um email de teste do sistema de diagnóstico',
          inviteId: 'test-invite-id',
          test: true
        }
      });
      
      if (error) {
        console.error('❌ [TEST-EMAIL] Erro no teste:', error);
        return {
          success: false,
          message: 'Teste falhou',
          error: error.message,
          method: 'test_email',
          strategy: 'resend_primary'
        };
      }
      
      console.log('✅ [TEST-EMAIL] Teste concluído:', data);
      
      return {
        success: data?.success || false,
        message: data?.message || 'Teste executado',
        emailId: data?.emailId,
        method: data?.method || 'test_email',
        strategy: data?.strategy || 'resend_primary'
      };
      
    } catch (error: any) {
      console.error('❌ [TEST-EMAIL] Erro crítico:', error);
      return {
        success: false,
        message: 'Erro durante teste',
        error: error.message,
        method: 'test_email',
        strategy: 'resend_primary'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    runDiagnostic,
    isRunning,
    lastDiagnostic,
    systemStatus,
    testEmailSend,
    recentAttempts,
    isLoading
  };
}
