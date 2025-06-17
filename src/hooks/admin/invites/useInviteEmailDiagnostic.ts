
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DiagnosticResult {
  component: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  value?: any;
}

export function useInviteEmailDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostic = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    
    const diagnostics: DiagnosticResult[] = [];

    try {
      // 1. Verificar Edge Function
      console.log('🔍 Testando Edge Function...');
      try {
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: 'teste@exemplo.com',
            inviteUrl: 'https://exemplo.com/convite/123',
            roleName: 'Teste',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            senderName: 'Sistema de Diagnóstico',
            notes: 'Teste de diagnóstico do sistema',
            inviteId: 'diagnostic-test'
          }
        });

        if (error) {
          diagnostics.push({
            component: 'Edge Function',
            status: 'error',
            message: 'Edge Function não está funcionando',
            details: error.message
          });
        } else if (data?.success) {
          diagnostics.push({
            component: 'Edge Function',
            status: 'success',
            message: `Funcionando via ${data.strategy}`,
            details: `Método: ${data.method}, Strategy: ${data.strategy}`
          });
        } else {
          diagnostics.push({
            component: 'Edge Function',
            status: 'warning',
            message: 'Edge Function respondeu mas falhou',
            details: data?.error || 'Resposta inesperada'
          });
        }
      } catch (funcError: any) {
        diagnostics.push({
          component: 'Edge Function',
          status: 'error',
          message: 'Erro ao chamar Edge Function',
          details: funcError.message
        });
      }

      // 2. Verificar configurações do Supabase
      try {
        const { data: configTest } = await supabase.from('invites').select('count').limit(1);
        diagnostics.push({
          component: 'Banco de Dados',
          status: 'success',
          message: 'Conexão com banco funcionando',
          details: 'Tabela invites acessível'
        });
      } catch (dbError: any) {
        diagnostics.push({
          component: 'Banco de Dados',
          status: 'error',
          message: 'Erro na conexão com banco',
          details: dbError.message
        });
      }

      // 3. Verificar tabela de tentativas
      try {
        const { data: attemptsTest } = await supabase.from('invite_send_attempts').select('count').limit(1);
        diagnostics.push({
          component: 'Tabela de Tentativas',
          status: 'success',
          message: 'Tabela invite_send_attempts funcionando',
          details: 'Sistema de monitoramento ativo'
        });
      } catch (attemptsError: any) {
        diagnostics.push({
          component: 'Tabela de Tentativas',
          status: 'error',
          message: 'Tabela invite_send_attempts não encontrada',
          details: 'Execute a migração para criar a tabela'
        });
      }

      // 4. Verificar últimos convites criados
      try {
        const { data: recentInvites } = await supabase
          .from('invites')
          .select('id, email, created_at, last_sent_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentInvites && recentInvites.length > 0) {
          const unsentCount = recentInvites.filter(invite => !invite.last_sent_at).length;
          diagnostics.push({
            component: 'Convites Recentes',
            status: unsentCount > 0 ? 'warning' : 'success',
            message: `${recentInvites.length} convites recentes encontrados`,
            details: unsentCount > 0 ? `${unsentCount} convites ainda não enviados` : 'Todos os convites foram enviados'
          });
        } else {
          diagnostics.push({
            component: 'Convites Recentes',
            status: 'warning',
            message: 'Nenhum convite encontrado',
            details: 'Crie um convite para testar o sistema'
          });
        }
      } catch (invitesError: any) {
        diagnostics.push({
          component: 'Convites Recentes',
          status: 'error',
          message: 'Erro ao buscar convites',
          details: invitesError.message
        });
      }

      // 5. Verificar últimas tentativas de envio
      try {
        const { data: recentAttempts } = await supabase
          .from('invite_send_attempts')
          .select('method_attempted, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentAttempts && recentAttempts.length > 0) {
          const successCount = recentAttempts.filter(attempt => attempt.status === 'sent').length;
          const failureCount = recentAttempts.filter(attempt => attempt.status === 'failed').length;
          
          diagnostics.push({
            component: 'Histórico de Envios',
            status: successCount > failureCount ? 'success' : 'warning',
            message: `${recentAttempts.length} tentativas recentes`,
            details: `${successCount} sucessos, ${failureCount} falhas`
          });
        } else {
          diagnostics.push({
            component: 'Histórico de Envios',
            status: 'warning',
            message: 'Nenhuma tentativa de envio registrada',
            details: 'Primeira execução ou sistema não está registrando tentativas'
          });
        }
      } catch (attemptsError: any) {
        diagnostics.push({
          component: 'Histórico de Envios',
          status: 'error',
          message: 'Erro ao verificar histórico',
          details: attemptsError.message
        });
      }

      setResults(diagnostics);

      // Mostrar resumo
      const successCount = diagnostics.filter(d => d.status === 'success').length;
      const errorCount = diagnostics.filter(d => d.status === 'error').length;
      const warningCount = diagnostics.filter(d => d.status === 'warning').length;

      if (errorCount === 0) {
        toast.success(`Diagnóstico concluído: ${successCount} sucessos, ${warningCount} avisos`);
      } else {
        toast.error(`Diagnóstico encontrou ${errorCount} problemas críticos`);
      }

    } catch (error: any) {
      console.error('Erro no diagnóstico:', error);
      toast.error('Erro ao executar diagnóstico', {
        description: error.message
      });
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    runDiagnostic,
    isRunning,
    results
  };
}
