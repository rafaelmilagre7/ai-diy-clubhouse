
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useInviteEmailService } from './useInviteEmailService';
import { DiagnosticData, SendInviteResponse, InviteSystemDiagnostic } from './types';

export function useInviteEmailDiagnostic(): InviteSystemDiagnostic {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticData>({
    timestamp: new Date().toISOString(),
    systemStatus: 'warning',
    resendStatus: 'warning',
    supabaseStatus: 'warning',
    edgeFunctionStatus: 'warning',
    configStatus: 'warning',
    recentAttempts: [],
    recommendations: ['Execute o diagnóstico para verificar o status do sistema'],
    details: {
      resendApiKey: false,
      edgeFunctionVersion: 'desconhecida',
      totalAttempts: 0,
      successRate: 0
    }
  });
  
  const { sendInviteEmail } = useInviteEmailService();

  const getRecentAttempts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('invite_send_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar tentativas recentes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tentativas recentes:', error);
      return [];
    }
  }, []);

  const testEmailSend = useCallback(async (email: string): Promise<SendInviteResponse> => {
    setIsLoading(true);
    try {
      const result = await sendInviteEmail({
        email,
        inviteUrl: 'https://example.com/test-invite',
        roleName: 'Test Role',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        senderName: 'Sistema de Teste',
        notes: 'Este é um email de teste do sistema de diagnóstico',
        inviteId: 'test-diagnostic-invite',
        forceResend: true
      });

      if (result.success) {
        toast.success('Email de teste enviado com sucesso!');
      } else {
        toast.error('Falha no envio do email de teste');
      }

      return result;
    } catch (error: any) {
      const errorResult: SendInviteResponse = {
        success: false,
        message: 'Erro no teste de envio',
        error: error.message
      };
      toast.error('Erro no teste de envio de email');
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [sendInviteEmail]);

  const runDiagnostic = useCallback(async (): Promise<DiagnosticData> => {
    setIsRunning(true);
    
    try {
      console.log('🔍 [DIAGNOSTIC] Iniciando diagnóstico completo do sistema de convites...');
      
      // Buscar tentativas recentes
      const recentAttempts = await getRecentAttempts();
      
      // Verificar status do Resend
      let resendStatus: 'healthy' | 'warning' | 'critical' = 'critical';
      let resendApiKey = false;
      
      try {
        const { data: testResult } = await supabase.functions.invoke('send-invite-email', {
          body: { 
            test: true,
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'test',
            expiresAt: new Date().toISOString()
          }
        });
        
        if (testResult?.hasResendKey) {
          resendApiKey = true;
          resendStatus = 'healthy';
        } else {
          resendStatus = 'warning';
        }
      } catch (error) {
        console.error('Erro ao testar Resend:', error);
        resendStatus = 'critical';
      }

      // Verificar status do Supabase
      let supabaseStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      try {
        const { error } = await supabase.from('invites').select('count').limit(1);
        if (error) {
          supabaseStatus = 'critical';
        }
      } catch (error) {
        supabaseStatus = 'critical';
      }

      // Verificar Edge Function
      let edgeFunctionStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      let edgeFunctionVersion = 'desconhecida';
      
      try {
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: { ping: true }
        });
        
        if (error) {
          edgeFunctionStatus = 'critical';
        } else if (data?.version) {
          edgeFunctionVersion = data.version;
          edgeFunctionStatus = 'healthy';
        } else {
          edgeFunctionStatus = 'warning';
        }
      } catch (error) {
        edgeFunctionStatus = 'critical';
      }

      // Calcular estatísticas
      const totalAttempts = recentAttempts.length;
      const successfulAttempts = recentAttempts.filter(attempt => attempt.status === 'sent').length;
      const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

      // Determinar status geral do sistema
      let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (resendStatus === 'critical' || supabaseStatus === 'critical' || edgeFunctionStatus === 'critical') {
        systemStatus = 'critical';
      } else if (resendStatus === 'warning' || supabaseStatus === 'warning' || edgeFunctionStatus === 'warning' || successRate < 80) {
        systemStatus = 'warning';
      }

      // Gerar recomendações
      const recommendations: string[] = [];
      
      if (!resendApiKey) {
        recommendations.push('Configure a chave RESEND_API_KEY nas configurações do Edge Function');
      }
      
      if (successRate < 50) {
        recommendations.push('Taxa de sucesso baixa - verifique os logs de erro');
      }
      
      if (edgeFunctionStatus === 'critical') {
        recommendations.push('Edge Function não está respondendo - verifique os logs');
      }
      
      if (systemStatus === 'healthy') {
        recommendations.push('Sistema funcionando corretamente');
      }

      const diagnosticResult: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus,
        resendStatus,
        supabaseStatus,
        edgeFunctionStatus,
        configStatus: resendApiKey ? 'healthy' : 'critical',
        recentAttempts,
        recommendations,
        details: {
          resendApiKey,
          edgeFunctionVersion,
          totalAttempts,
          successRate,
          lastError: recentAttempts.find(a => a.error_message)?.error_message
        }
      };

      setLastDiagnostic(diagnosticResult);
      
      console.log('✅ [DIAGNOSTIC] Diagnóstico concluído:', diagnosticResult);
      
      return diagnosticResult;
      
    } catch (error: any) {
      console.error('❌ [DIAGNOSTIC] Erro no diagnóstico:', error);
      
      const errorResult: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus: 'critical',
        resendStatus: 'critical',
        supabaseStatus: 'critical',
        edgeFunctionStatus: 'critical',
        configStatus: 'critical',
        recentAttempts: [],
        recommendations: ['Erro crítico no sistema de diagnóstico'],
        details: {
          resendApiKey: false,
          edgeFunctionVersion: 'erro',
          totalAttempts: 0,
          successRate: 0,
          lastError: error.message
        }
      };
      
      setLastDiagnostic(errorResult);
      return errorResult;
      
    } finally {
      setIsRunning(false);
    }
  }, [getRecentAttempts]);

  return {
    runDiagnostic,
    isRunning,
    lastDiagnostic,
    systemStatus: lastDiagnostic.systemStatus,
    testEmailSend,
    recentAttempts: lastDiagnostic.recentAttempts,
    isLoading
  };
}
