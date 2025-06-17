
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DiagnosticData, InviteSystemDiagnostic } from './types';

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
  const [recentAttempts, setRecentAttempts] = useState<Array<{
    id: string;
    email: string;
    status: string;
    method_attempted: string;
    created_at: string;
    error_message?: string;
  }>>([]);

  const runDiagnostic = useCallback(async (): Promise<DiagnosticData> => {
    try {
      setIsRunning(true);
      console.log('🔍 [DIAGNOSTIC] Iniciando diagnóstico do sistema...');

      const diagnosticData: DiagnosticData = {
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
      };

      // 1. Verificar configurações
      console.log('🔧 [DIAGNOSTIC] Verificando configurações...');
      const hasResendKey = !!process.env.REACT_APP_RESEND_API_KEY;
      diagnosticData.details.resendApiKey = hasResendKey;
      
      if (!hasResendKey) {
        diagnosticData.configStatus = 'critical';
        diagnosticData.recommendations.push('Configure a chave RESEND_API_KEY nas variáveis de ambiente');
      }

      // 2. Verificar Supabase
      console.log('🗄️ [DIAGNOSTIC] Verificando conexão Supabase...');
      try {
        const { error: supabaseError } = await supabase
          .from('invites')
          .select('count(*)')
          .limit(1);
        
        if (supabaseError) {
          diagnosticData.supabaseStatus = 'critical';
          diagnosticData.recommendations.push('Problema na conexão com Supabase: ' + supabaseError.message);
        }
      } catch (err) {
        diagnosticData.supabaseStatus = 'critical';
        diagnosticData.recommendations.push('Erro crítico no Supabase');
      }

      // 3. Buscar tentativas recentes
      console.log('📊 [DIAGNOSTIC] Buscando tentativas recentes...');
      try {
        const { data: attempts, error: attemptsError } = await supabase
          .from('invite_send_attempts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (attemptsError) {
          console.warn('⚠️ [DIAGNOSTIC] Erro ao buscar tentativas:', attemptsError);
        } else if (attempts) {
          diagnosticData.recentAttempts = attempts;
          setRecentAttempts(attempts);
          
          diagnosticData.details.totalAttempts = attempts.length;
          const successCount = attempts.filter(a => a.status === 'sent').length;
          diagnosticData.details.successRate = attempts.length > 0 ? 
            Math.round((successCount / attempts.length) * 100) : 0;
        }
      } catch (err) {
        console.error('❌ [DIAGNOSTIC] Erro ao buscar tentativas:', err);
      }

      // 4. Testar Edge Function
      console.log('⚡ [DIAGNOSTIC] Testando Edge Function...');
      try {
        const { data, error } = await Promise.race([
          supabase.functions.invoke('send-invite-email', {
            body: { test: true }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]) as any;

        if (error || data?.error) {
          diagnosticData.edgeFunctionStatus = 'warning';
          diagnosticData.recommendations.push('Edge Function não está respondendo adequadamente');
        }
      } catch (err) {
        diagnosticData.edgeFunctionStatus = 'critical';
        diagnosticData.recommendations.push('Edge Function indisponível ou com timeout');
      }

      // 5. Determinar status geral do sistema
      const statuses = [
        diagnosticData.configStatus,
        diagnosticData.supabaseStatus,
        diagnosticData.edgeFunctionStatus
      ];

      if (statuses.includes('critical')) {
        diagnosticData.systemStatus = 'critical';
      } else if (statuses.includes('warning')) {
        diagnosticData.systemStatus = 'warning';
      } else {
        diagnosticData.systemStatus = 'healthy';
      }

      // 6. Determinar status do Resend
      if (!hasResendKey) {
        diagnosticData.resendStatus = 'critical';
      } else if (diagnosticData.details.successRate < 50) {
        diagnosticData.resendStatus = 'warning';
      } else {
        diagnosticData.resendStatus = 'healthy';
      }

      console.log('✅ [DIAGNOSTIC] Diagnóstico concluído:', diagnosticData);
      setLastDiagnostic(diagnosticData);
      
      return diagnosticData;
    } catch (error: any) {
      console.error('❌ [DIAGNOSTIC] Erro no diagnóstico:', error);
      
      const errorDiagnostic: DiagnosticData = {
        timestamp: new Date().toISOString(),
        systemStatus: 'critical',
        resendStatus: 'critical',
        supabaseStatus: 'critical',
        edgeFunctionStatus: 'critical',
        configStatus: 'critical',
        recentAttempts: [],
        recommendations: ['Erro crítico no sistema de diagnóstico: ' + error.message],
        details: {
          resendApiKey: false,
          edgeFunctionVersion: 'unknown',
          totalAttempts: 0,
          successRate: 0,
          lastError: error.message
        }
      };
      
      setLastDiagnostic(errorDiagnostic);
      return errorDiagnostic;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const testEmailSend = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      console.log('📧 [TEST] Testando envio para:', email);

      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          test: true,
          inviteUrl: 'https://test.com',
          roleName: 'teste',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Teste'
        }
      });

      if (error) {
        return {
          success: false,
          message: 'Teste falhou',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Email de teste enviado com sucesso',
        method: 'edge_function'
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Erro no teste de email',
        error: err.message
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const systemStatus = lastDiagnostic.systemStatus;

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
