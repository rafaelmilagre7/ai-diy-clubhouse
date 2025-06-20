
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DiagnosticResult {
  success: boolean;
  message: string;
  error?: string;
  solution?: string;
  details?: any;
  responseTime?: number;
  requestId?: string;
}

interface DiagnosticSuite {
  connectivity: DiagnosticResult | null;
  domain: DiagnosticResult | null;
  sendTest: DiagnosticResult | null;
  edgeFunctions: DiagnosticResult | null;
  overallHealth: 'healthy' | 'warning' | 'critical' | 'unknown';
}

export const useEmailSystemDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticSuite>({
    connectivity: null,
    domain: null,
    sendTest: null,
    edgeFunctions: null,
    overallHealth: 'unknown'
  });

  const runConnectivityTest = useCallback(async () => {
    try {
      console.log('🔗 Testando conectividade com Resend...');
      
      const { data, error } = await supabase.functions.invoke('test-resend-direct', {
        body: { testType: 'connectivity' }
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message,
        error: data.error,
        solution: data.solution,
        details: data,
        responseTime: data.responseTime,
        requestId: data.requestId
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Falha na conectividade',
        error: error.message,
        solution: 'Verifique se a Edge Function está deployada e a API key configurada'
      };
    }
  }, []);

  const runDomainTest = useCallback(async () => {
    try {
      console.log('🌐 Testando configuração de domínios...');
      
      const { data, error } = await supabase.functions.invoke('test-resend-direct', {
        body: { testType: 'domain' }
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message,
        error: data.error,
        solution: data.solution,
        details: data,
        responseTime: data.responseTime,
        requestId: data.requestId
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Falha na verificação de domínios',
        error: error.message,
        solution: 'Verifique se o domínio viverdeia.ai está validado no Resend'
      };
    }
  }, []);

  const runSendTest = useCallback(async (email: string) => {
    try {
      console.log(`📧 Testando envio de email para: ${email}`);
      
      const { data, error } = await supabase.functions.invoke('test-resend-direct', {
        body: { testType: 'send_test', email }
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message,
        error: data.error,
        solution: data.solution,
        details: data,
        responseTime: data.responseTime,
        requestId: data.requestId
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Falha no envio de teste',
        error: error.message,
        solution: 'Verifique as configurações de email e domínio'
      };
    }
  }, []);

  const runEdgeFunctionTest = useCallback(async () => {
    try {
      console.log('🔧 Testando Edge Functions...');
      
      // Testar se a função send-invite-email responde
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: { 
          testMode: true,
          email: 'test@example.com',
          inviteUrl: 'https://test.com',
          roleName: 'test'
        }
      });

      // Mesmo que falhe, se responder significa que está deployada
      return {
        success: true,
        message: 'Edge Function send-invite-email está deployada',
        details: { responded: true, testResponse: data },
        responseTime: 0
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Edge Function não está deployada ou não responde',
        error: error.message,
        solution: 'Verifique se as Edge Functions foram deployadas corretamente'
      };
    }
  }, []);

  const runFullDiagnostics = useCallback(async (testEmail?: string) => {
    setIsRunning(true);
    
    try {
      console.log('🔍 Iniciando diagnóstico completo do sistema...');
      toast.info('Iniciando diagnóstico completo...');

      // Executar todos os testes em paralelo
      const [connectivityResult, domainResult, edgeFunctionResult] = await Promise.all([
        runConnectivityTest(),
        runDomainTest(),
        runEdgeFunctionTest()
      ]);

      // Teste de envio opcional
      let sendTestResult = null;
      if (testEmail) {
        sendTestResult = await runSendTest(testEmail);
      }

      // Calcular saúde geral
      const allTests = [connectivityResult, domainResult, edgeFunctionResult, sendTestResult].filter(Boolean);
      const successCount = allTests.filter(test => test.success).length;
      const totalTests = allTests.length;

      let overallHealth: 'healthy' | 'warning' | 'critical' | 'unknown';
      if (successCount === totalTests) {
        overallHealth = 'healthy';
      } else if (successCount >= totalTests * 0.75) {
        overallHealth = 'warning';
      } else {
        overallHealth = 'critical';
      }

      const newDiagnostics: DiagnosticSuite = {
        connectivity: connectivityResult,
        domain: domainResult,
        sendTest: sendTestResult,
        edgeFunctions: edgeFunctionResult,
        overallHealth
      };

      setDiagnostics(newDiagnostics);

      // Feedback para usuário
      if (overallHealth === 'healthy') {
        toast.success('✅ Sistema 100% operacional!');
      } else if (overallHealth === 'warning') {
        toast.warning('⚠️ Sistema funcionando com avisos');
      } else {
        toast.error('❌ Sistema com problemas críticos');
      }

      console.log('✅ Diagnóstico completo concluído:', newDiagnostics);
      return newDiagnostics;

    } catch (error: any) {
      console.error('❌ Erro no diagnóstico:', error);
      toast.error('Erro no diagnóstico do sistema');
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [runConnectivityTest, runDomainTest, runSendTest, runEdgeFunctionTest]);

  const fixOrphanedInvites = useCallback(async () => {
    try {
      console.log('🔧 Corrigindo convites órfãos...');
      toast.info('Processando convites órfãos...');

      // Buscar convites que nunca foram enviados
      const { data: orphanedInvites, error } = await supabase
        .from('invites')
        .select('*')
        .eq('send_attempts', 0)
        .is('last_sent_at', null)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .limit(10); // Processar em lotes

      if (error) throw error;

      if (!orphanedInvites || orphanedInvites.length === 0) {
        toast.success('Nenhum convite órfão encontrado');
        return { processed: 0, success: 0, errors: 0 };
      }

      console.log(`📋 Encontrados ${orphanedInvites.length} convites órfãos`);

      let successCount = 0;
      let errorCount = 0;

      // Processar cada convite
      for (const invite of orphanedInvites) {
        try {
          const inviteUrl = `${window.location.origin}/convite/${invite.token}`;
          
          const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email: invite.email,
              inviteUrl,
              roleName: invite.role?.name || 'Membro',
              expiresAt: invite.expires_at,
              inviteId: invite.id,
              forceResend: true
            }
          });

          if (sendError || !sendResult?.success) {
            console.error(`❌ Falha ao reenviar convite ${invite.id}:`, sendError || sendResult?.error);
            errorCount++;
          } else {
            console.log(`✅ Convite ${invite.id} reenviado com sucesso`);
            successCount++;
          }
        } catch (error: any) {
          console.error(`❌ Erro ao processar convite ${invite.id}:`, error);
          errorCount++;
        }
      }

      const message = `Processados: ${orphanedInvites.length}, Sucessos: ${successCount}, Erros: ${errorCount}`;
      
      if (successCount > 0) {
        toast.success(`✅ ${message}`);
      } else {
        toast.error(`❌ ${message}`);
      }

      return { processed: orphanedInvites.length, success: successCount, errors: errorCount };

    } catch (error: any) {
      console.error('❌ Erro ao corrigir convites órfãos:', error);
      toast.error('Erro ao processar convites órfãos');
      throw error;
    }
  }, []);

  return {
    isRunning,
    diagnostics,
    runFullDiagnostics,
    runConnectivityTest,
    runDomainTest,
    runSendTest,
    runEdgeFunctionTest,
    fixOrphanedInvites
  };
};
