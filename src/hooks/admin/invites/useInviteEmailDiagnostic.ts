
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DiagnosticResult {
  resendConfigured: boolean;
  edgeFunctionExists: boolean;
  edgeFunctionResponding: boolean;
  recentInvites: any[];
  failedInvites: any[];
  systemHealth: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
  testResults: {
    edgeFunctionTest: boolean;
    resendTest: boolean;
    fallbackTest: boolean;
  };
}

export const useInviteEmailDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticResult | null>(null);

  const runDiagnostic = useCallback(async (): Promise<DiagnosticResult> => {
    setIsRunning(true);
    console.log('🔍 [DIAGNOSTIC] Iniciando diagnóstico completo do sistema...');

    try {
      const result: DiagnosticResult = {
        resendConfigured: false,
        edgeFunctionExists: false,
        edgeFunctionResponding: false,
        recentInvites: [],
        failedInvites: [],
        systemHealth: 'critical',
        recommendations: [],
        testResults: {
          edgeFunctionTest: false,
          resendTest: false,
          fallbackTest: false
        }
      };

      // 1. Testar Edge Function com timeout mais longo
      try {
        console.log('🧪 [DIAGNOSTIC] Testando Edge Function send-invite-email...');
        
        const testPayload = {
          email: 'test@diagnostic.local',
          inviteUrl: 'https://test.com/diagnostic',
          roleName: 'teste-diagnostico',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Diagnóstico',
          notes: 'Teste automático do sistema',
          forceResend: false
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: testPayload
        });

        clearTimeout(timeoutId);

        console.log('📊 [DIAGNOSTIC] Resposta da Edge Function:', { data, error });

        if (!error) {
          result.edgeFunctionExists = true;
          result.edgeFunctionResponding = true;
          result.testResults.edgeFunctionTest = true;
          console.log('✅ [DIAGNOSTIC] Edge Function respondeu corretamente');
        } else {
          console.log('❌ [DIAGNOSTIC] Edge Function retornou erro:', error);
          result.recommendations.push(`Edge Function erro: ${error.message}`);
        }

      } catch (edgeError: any) {
        console.log('❌ [DIAGNOSTIC] Edge Function falhou completamente:', edgeError);
        if (edgeError.name === 'AbortError') {
          result.recommendations.push('Edge Function não responde (timeout de 10s)');
        } else {
          result.recommendations.push(`Edge Function não acessível: ${edgeError.message}`);
        }
      }

      // 2. Buscar convites recentes (últimos 7 dias)
      try {
        const { data: recentInvites, error: invitesError } = await supabase
          .from('invites')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (!invitesError && recentInvites) {
          result.recentInvites = recentInvites;
          console.log(`📊 [DIAGNOSTIC] ${recentInvites.length} convites recentes encontrados`);
        }
      } catch (invitesError) {
        console.log('⚠️ [DIAGNOSTIC] Erro ao buscar convites:', invitesError);
        result.recommendations.push('Erro ao acessar tabela de convites');
      }

      // 3. Buscar tentativas de envio falhadas
      try {
        const { data: failedAttempts, error: failedError } = await supabase
          .from('invite_send_attempts')
          .select('*')
          .eq('status', 'failed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!failedError && failedAttempts) {
          result.failedInvites = failedAttempts;
          console.log(`🚨 [DIAGNOSTIC] ${failedAttempts.length} tentativas falhadas encontradas`);
        }
      } catch (failedError) {
        console.log('⚠️ [DIAGNOSTIC] Erro ao buscar falhas (tabela pode não existir):', failedError);
        result.recommendations.push('Tabela invite_send_attempts pode não existir');
      }

      // 4. Verificar configuração do Resend
      result.resendConfigured = result.edgeFunctionResponding; // Se a function responde, Resend está configurado

      // 5. Determinar saúde do sistema
      if (result.edgeFunctionResponding && result.failedInvites.length === 0) {
        result.systemHealth = 'healthy';
      } else if (result.edgeFunctionExists && result.failedInvites.length < 3) {
        result.systemHealth = 'warning';
      } else {
        result.systemHealth = 'critical';
      }

      // 6. Gerar recomendações específicas
      if (!result.edgeFunctionExists) {
        result.recommendations.push('Edge Function send-invite-email não está deployada');
        result.recommendations.push('Verificar logs de deploy do Supabase');
      } else if (!result.edgeFunctionResponding) {
        result.recommendations.push('Edge Function existe mas não responde');
        result.recommendations.push('Verificar variável RESEND_API_KEY');
        result.recommendations.push('Verificar logs da Edge Function');
      }
      
      if (result.failedInvites.length > 0) {
        result.recommendations.push(`${result.failedInvites.length} convites falharam - verificar logs detalhados`);
      }
      
      if (result.recentInvites.length === 0) {
        result.recommendations.push('Nenhum convite recente - testar criação de convite');
      }

      // Sempre incluir estas verificações
      if (!result.edgeFunctionResponding) {
        result.recommendations.push('1. Verificar se RESEND_API_KEY está configurada no Supabase');
        result.recommendations.push('2. Validar domínio viverdeia.ai no Resend.com');
        result.recommendations.push('3. Verificar deploy da Edge Function');
        result.recommendations.push('4. Testar criação de convite direto');
      }

      setLastDiagnostic(result);
      
      // Feedback para o usuário
      switch (result.systemHealth) {
        case 'healthy':
          toast.success('✅ Sistema de convites funcionando perfeitamente!');
          break;
        case 'warning':
          toast.warning('⚠️ Sistema de convites com problemas menores');
          break;
        case 'critical':
          toast.error('🚨 Sistema de convites precisa de atenção urgente');
          break;
      }

      return result;

    } catch (error: any) {
      console.error('❌ [DIAGNOSTIC] Erro no diagnóstico:', error);
      toast.error('Erro ao executar diagnóstico completo');
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const testInviteEmail = useCallback(async (testEmail: string) => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Email de teste inválido');
      return false;
    }

    try {
      console.log('🧪 [TEST] Enviando convite de teste para:', testEmail);
      
      const testPayload = {
        email: testEmail,
        inviteUrl: `${window.location.origin}/convite/teste-${Date.now()}`,
        roleName: 'Teste',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        senderName: 'Sistema de Teste',
        notes: 'Este é um teste completo do sistema de convites',
        forceResend: true
      };

      console.log('📤 [TEST] Payload do teste:', testPayload);

      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: testPayload
      });

      console.log('📥 [TEST] Resposta recebida:', { data, error });

      if (error) {
        console.error('❌ [TEST] Erro na Edge Function:', error);
        toast.error('Falha no teste de envio', {
          description: `Erro: ${error.message}`
        });
        return false;
      }

      if (data?.success) {
        toast.success(`✅ Convite de teste enviado para ${testEmail}!`, {
          description: `Estratégia: ${data.strategy || 'desconhecida'}, Método: ${data.method || 'desconhecido'}`
        });
        return true;
      }

      throw new Error(data?.error || data?.message || 'Falha desconhecida no envio');

    } catch (error: any) {
      console.error('❌ [TEST] Erro no teste:', error);
      toast.error('Falha crítica no teste de envio', {
        description: error.message
      });
      return false;
    }
  }, []);

  return {
    runDiagnostic,
    testInviteEmail,
    isRunning,
    lastDiagnostic
  };
};
