
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';

interface AuditResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface AuditReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  results: AuditResult[];
  timestamp: string;
}

export const useInviteAudit = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const { log, logWarning } = useLogging();

  const runAudit = async (): Promise<AuditReport> => {
    setIsAuditing(true);
    const results: AuditResult[] = [];

    try {
      log('Iniciando auditoria completa do sistema de convites');

      // 1. Auditoria de Dados Reais
      await auditDataIntegrity(results);
      
      // 2. Auditoria de Performance
      await auditPerformance(results);
      
      // 3. Auditoria de Validações
      await auditValidations(results);
      
      // 4. Auditoria de Integrações
      await auditIntegrations(results);
      
      // 5. Auditoria de Segurança
      await auditSecurity(results);

      const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'pass').length,
        failed: results.filter(r => r.status === 'fail').length,
        warnings: results.filter(r => r.status === 'warning').length,
      };

      const report: AuditReport = {
        summary,
        results,
        timestamp: new Date().toISOString()
      };

      setAuditReport(report);
      log('Auditoria completa finalizada', { summary });
      
      return report;

    } catch (error: any) {
      logWarning('Erro durante auditoria', { error: error.message });
      throw error;
    } finally {
      setIsAuditing(false);
    }
  };

  const auditDataIntegrity = async (results: AuditResult[]) => {
    try {
      // Verificar se há dados reais na tabela invites
      const { data: invites, error } = await supabase
        .from('invites')
        .select('id, email, token, created_at, used_at, expires_at')
        .limit(10);

      if (error) {
        results.push({
          category: 'Integridade de Dados',
          test: 'Conexão com tabela invites',
          status: 'fail',
          message: `Erro ao acessar dados: ${error.message}`,
          details: { error }
        });
        return;
      }

      results.push({
        category: 'Integridade de Dados',
        test: 'Conexão com tabela invites',
        status: 'pass',
        message: `${invites?.length || 0} convites encontrados`
      });

      // Verificar qualidade dos dados
      if (invites && invites.length > 0) {
        const validEmails = invites.filter(i => i.email && i.email.includes('@'));
        const validTokens = invites.filter(i => i.token && i.token.length >= 8);
        
        if (validEmails.length === invites.length) {
          results.push({
            category: 'Integridade de Dados',
            test: 'Validação de emails',
            status: 'pass',
            message: 'Todos os emails são válidos'
          });
        } else {
          results.push({
            category: 'Integridade de Dados',
            test: 'Validação de emails',
            status: 'fail',
            message: `${invites.length - validEmails.length} emails inválidos encontrados`
          });
        }

        if (validTokens.length === invites.length) {
          results.push({
            category: 'Integridade de Dados',
            test: 'Validação de tokens',
            status: 'pass',
            message: 'Todos os tokens são válidos'
          });
        } else {
          results.push({
            category: 'Integridade de Dados',
            test: 'Validação de tokens',
            status: 'fail',
            message: `${invites.length - validTokens.length} tokens inválidos encontrados`
          });
        }
      }

      // Verificar se há dados de analytics reais
      const { data: analytics } = await supabase
        .from('analytics')
        .select('id, event_type, created_at')
        .eq('event_type', 'invite_sent')
        .limit(5);

      if (analytics && analytics.length > 0) {
        results.push({
          category: 'Integridade de Dados',
          test: 'Analytics de convites',
          status: 'pass',
          message: `${analytics.length} eventos de convite registrados`
        });
      } else {
        results.push({
          category: 'Integridade de Dados',
          test: 'Analytics de convites',
          status: 'warning',
          message: 'Nenhum evento de convite encontrado nos analytics'
        });
      }

    } catch (error: any) {
      results.push({
        category: 'Integridade de Dados',
        test: 'Auditoria geral de dados',
        status: 'fail',
        message: `Erro inesperado: ${error.message}`
      });
    }
  };

  const auditPerformance = async (results: AuditResult[]) => {
    try {
      // Teste de performance da query principal
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          token,
          expires_at,
          used_at,
          created_at,
          user_roles:role_id!inner(id, name, description)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      if (error) {
        results.push({
          category: 'Performance',
          test: 'Query principal de convites',
          status: 'fail',
          message: `Erro na query: ${error.message}`
        });
      } else if (queryTime > 2000) {
        results.push({
          category: 'Performance',
          test: 'Query principal de convites',
          status: 'warning',
          message: `Query lenta: ${queryTime.toFixed(2)}ms`,
          details: { queryTime, recordCount: data?.length }
        });
      } else {
        results.push({
          category: 'Performance',
          test: 'Query principal de convites',
          status: 'pass',
          message: `Query rápida: ${queryTime.toFixed(2)}ms (${data?.length} registros)`
        });
      }

      // Verificar índices implicitamente
      const indexTestStart = performance.now();
      
      const { data: tokenTest } = await supabase
        .from('invites')
        .select('id')
        .eq('token', 'TEST_TOKEN_PERFORMANCE')
        .limit(1);

      const indexTestEnd = performance.now();
      const indexTime = indexTestEnd - indexTestStart;

      if (indexTime < 100) {
        results.push({
          category: 'Performance',
          test: 'Busca por token (índice)',
          status: 'pass',
          message: `Busca por token eficiente: ${indexTime.toFixed(2)}ms`
        });
      } else {
        results.push({
          category: 'Performance',
          test: 'Busca por token (índice)',
          status: 'warning',
          message: `Busca por token lenta: ${indexTime.toFixed(2)}ms - considerar adicionar índice`
        });
      }

    } catch (error: any) {
      results.push({
        category: 'Performance',
        test: 'Testes de performance',
        status: 'fail',
        message: `Erro durante testes: ${error.message}`
      });
    }
  };

  const auditValidations = async (results: AuditResult[]) => {
    try {
      // Testar função de criação de convite
      const { data: testCreateResult, error: createError } = await supabase
        .rpc('create_invite', {
          p_email: 'test@audit.com',
          p_role_id: '00000000-0000-0000-0000-000000000000', // UUID inválido propositalmente
          p_expires_in: '7 days',
          p_notes: 'Teste de auditoria'
        });

      if (createError) {
        results.push({
          category: 'Validações',
          test: 'Função create_invite com dados inválidos',
          status: 'pass',
          message: 'Função rejeitou corretamente dados inválidos'
        });
      } else {
        results.push({
          category: 'Validações',
          test: 'Função create_invite com dados inválidos',
          status: 'warning',
          message: 'Função deveria rejeitar role_id inválido'
        });
      }

      // Testar função use_invite
      const { data: testUseResult, error: useError } = await supabase
        .rpc('use_invite', {
          invite_token: 'TOKEN_INEXISTENTE_TESTE',
          user_id: '00000000-0000-0000-0000-000000000000'
        });

      if (useError || (testUseResult && typeof testUseResult === 'object' && testUseResult.status === 'error')) {
        results.push({
          category: 'Validações',
          test: 'Função use_invite com token inválido',
          status: 'pass',
          message: 'Função rejeitou corretamente token inválido'
        });
      } else {
        results.push({
          category: 'Validações',
          test: 'Função use_invite com token inválido',
          status: 'fail',
          message: 'Função deveria rejeitar token inexistente'
        });
      }

      // Verificar se há políticas RLS ativas
      const { data: rlsCheck } = await supabase
        .rpc('check_rls_status')
        .single();

      if (rlsCheck) {
        const inviteTableSecurity = rlsCheck.find((table: any) => table.table_name === 'invites');
        
        if (inviteTableSecurity?.rls_enabled && inviteTableSecurity?.has_policies) {
          results.push({
            category: 'Validações',
            test: 'Segurança RLS na tabela invites',
            status: 'pass',
            message: 'RLS ativo com políticas configuradas'
          });
        } else {
          results.push({
            category: 'Validações',
            test: 'Segurança RLS na tabela invites',
            status: 'fail',
            message: 'RLS não configurado adequadamente'
          });
        }
      }

    } catch (error: any) {
      results.push({
        category: 'Validações',
        test: 'Testes de validação',
        status: 'fail',
        message: `Erro durante validações: ${error.message}`
      });
    }
  };

  const auditIntegrations = async (results: AuditResult[]) => {
    try {
      // Testar Edge Function de email
      const emailTestResponse = await supabase.functions.invoke('send-invite-email', {
        body: {
          inviteId: 'test-audit-id',
          email: 'audit@test.com',
          roleId: 'test-role-id',
          token: 'TEST123456',
          isResend: false,
          notes: 'Teste de auditoria - não enviar'
        }
      });

      if (emailTestResponse.error) {
        if (emailTestResponse.error.message.includes('RESEND_API_KEY')) {
          results.push({
            category: 'Integrações',
            test: 'Edge Function de email',
            status: 'warning',
            message: 'RESEND_API_KEY não configurada'
          });
        } else {
          results.push({
            category: 'Integrações',
            test: 'Edge Function de email',
            status: 'fail',
            message: `Erro na função: ${emailTestResponse.error.message}`
          });
        }
      } else {
        results.push({
          category: 'Integrações',
          test: 'Edge Function de email',
          status: 'pass',
          message: 'Função de email respondeu corretamente'
        });
      }

      // Testar orquestrador de convites
      const orchestratorResponse = await supabase.functions.invoke('invite-orchestrator', {
        body: {
          inviteId: 'test-audit-id',
          email: 'audit@test.com',
          roleId: 'test-role-id',
          token: 'TEST123456',
          channels: ['email'],
          isResend: false
        }
      });

      if (orchestratorResponse.error) {
        results.push({
          category: 'Integrações',
          test: 'Orquestrador de convites',
          status: 'fail',
          message: `Erro no orquestrador: ${orchestratorResponse.error.message}`
        });
      } else {
        results.push({
          category: 'Integrações',
          test: 'Orquestrador de convites',
          status: 'pass',
          message: 'Orquestrador funcionando corretamente'
        });
      }

    } catch (error: any) {
      results.push({
        category: 'Integrações',
        test: 'Testes de integração',
        status: 'fail',
        message: `Erro durante testes: ${error.message}`
      });
    }
  };

  const auditSecurity = async (results: AuditResult[]) => {
    try {
      // Verificar se há convites expirados não limpos
      const { data: expiredInvites } = await supabase
        .from('invites')
        .select('id')
        .lt('expires_at', new Date().toISOString())
        .is('used_at', null);

      if (expiredInvites && expiredInvites.length > 0) {
        results.push({
          category: 'Segurança',
          test: 'Limpeza de convites expirados',
          status: 'warning',
          message: `${expiredInvites.length} convites expirados não utilizados encontrados`
        });
      } else {
        results.push({
          category: 'Segurança',
          test: 'Limpeza de convites expirados',
          status: 'pass',
          message: 'Nenhum convite expirado não utilizado encontrado'
        });
      }

      // Verificar unicidade de tokens
      const { data: tokenCheck } = await supabase
        .from('invites')
        .select('token')
        .limit(100);

      if (tokenCheck) {
        const uniqueTokens = new Set(tokenCheck.map(i => i.token));
        
        if (uniqueTokens.size === tokenCheck.length) {
          results.push({
            category: 'Segurança',
            test: 'Unicidade de tokens',
            status: 'pass',
            message: 'Todos os tokens são únicos'
          });
        } else {
          results.push({
            category: 'Segurança',
            test: 'Unicidade de tokens',
            status: 'fail',
            message: 'Tokens duplicados encontrados!'
          });
        }
      }

      // Verificar se há tentativas excessivas de envio
      const { data: highAttempts } = await supabase
        .from('invites')
        .select('id, email, send_attempts')
        .gt('send_attempts', 5);

      if (highAttempts && highAttempts.length > 0) {
        results.push({
          category: 'Segurança',
          test: 'Tentativas excessivas de envio',
          status: 'warning',
          message: `${highAttempts.length} convites com mais de 5 tentativas de envio`
        });
      } else {
        results.push({
          category: 'Segurança',
          test: 'Tentativas excessivas de envio',
          status: 'pass',
          message: 'Nenhuma tentativa excessiva detectada'
        });
      }

    } catch (error: any) {
      results.push({
        category: 'Segurança',
        test: 'Testes de segurança',
        status: 'fail',
        message: `Erro durante testes: ${error.message}`
      });
    }
  };

  return {
    runAudit,
    isAuditing,
    auditReport
  };
};
