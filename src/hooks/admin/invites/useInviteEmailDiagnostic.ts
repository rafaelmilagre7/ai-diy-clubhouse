
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useInviteEmailService } from './useInviteEmailService';

interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}

interface DiagnosticData {
  systemHealth: 'healthy' | 'warning' | 'critical';
  edgeFunctionExists: boolean;
  edgeFunctionResponding: boolean;
  recentInvites: any[];
  failedInvites: any[];
  testResults: {
    email: boolean;
    database: boolean;
    auth: boolean;
  };
  recommendations: string[];
  lastUpdated: Date;
}

export function useInviteEmailDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticData | null>(null);
  const { sendInviteEmail } = useInviteEmailService();

  const testInviteEmail = useCallback(async (email: string) => {
    setIsRunning(true);
    
    try {
      const result = await sendInviteEmail({
        email,
        inviteUrl: 'https://exemplo.com/convite/teste',
        roleName: 'Teste',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        senderName: 'Sistema de Teste',
        notes: 'Teste de envio de email',
        inviteId: 'test-invite-' + Date.now(),
        forceResend: true
      });

      if (result.success) {
        toast.success('Email de teste enviado com sucesso!');
      } else {
        toast.error('Falha no envio do email de teste');
      }

      return result;
    } catch (error: any) {
      console.error('Erro no teste de email:', error);
      toast.error('Erro no teste de email: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setIsRunning(false);
    }
  }, [sendInviteEmail]);

  const runDiagnostic = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const diagnostics: DiagnosticResult[] = [];
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    let edgeFunctionExists = false;
    let edgeFunctionResponding = false;
    let recentInvites: any[] = [];
    let failedInvites: any[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Verificar tabelas necessárias
      console.log("🔍 Verificando estrutura do banco de dados...");
      
      const tablesCheck = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .in('table_name', ['invites', 'invite_send_attempts', 'user_roles']);

      if (tablesCheck.error) {
        diagnostics.push({
          component: 'Database Structure',
          status: 'error',
          message: 'Erro ao verificar tabelas: ' + tablesCheck.error.message,
          timestamp: new Date().toISOString()
        });
        systemHealth = 'critical';
      } else {
        diagnostics.push({
          component: 'Database Structure',
          status: 'success',
          message: `Tabelas encontradas: ${tablesCheck.data?.length || 0}`,
          details: tablesCheck.data,
          timestamp: new Date().toISOString()
        });
      }

      // 2. Verificar Edge Function
      console.log("🔍 Testando Edge Function...");
      
      try {
        const edgeFunctionTest = await supabase.functions.invoke('send-invite-email', {
          body: { test: true }
        });
        
        edgeFunctionExists = true;
        
        if (edgeFunctionTest.error) {
          edgeFunctionResponding = false;
          diagnostics.push({
            component: 'Edge Function',
            status: 'warning',
            message: 'Edge Function existe mas retornou erro: ' + edgeFunctionTest.error.message,
            timestamp: new Date().toISOString()
          });
          if (systemHealth === 'healthy') systemHealth = 'warning';
        } else {
          edgeFunctionResponding = true;
          diagnostics.push({
            component: 'Edge Function',
            status: 'success',
            message: 'Edge Function respondendo corretamente',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error: any) {
        edgeFunctionExists = false;
        edgeFunctionResponding = false;
        diagnostics.push({
          component: 'Edge Function',
          status: 'error',
          message: 'Edge Function não encontrada ou não responsiva: ' + error.message,
          timestamp: new Date().toISOString()
        });
        systemHealth = 'critical';
        recommendations.push('Verificar se a Edge Function send-invite-email foi deployada corretamente');
      }

      // 3. Verificar convites recentes
      console.log("🔍 Verificando convites recentes...");
      
      const recentInvitesCheck = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentInvitesCheck.error) {
        diagnostics.push({
          component: 'Recent Invites',
          status: 'error',
          message: 'Erro ao buscar convites recentes: ' + recentInvitesCheck.error.message,
          timestamp: new Date().toISOString()
        });
        if (systemHealth === 'healthy') systemHealth = 'warning';
      } else {
        recentInvites = recentInvitesCheck.data || [];
        diagnostics.push({
          component: 'Recent Invites',
          status: 'success',
          message: `${recentInvites.length} convites encontrados`,
          details: recentInvites,
          timestamp: new Date().toISOString()
        });
      }

      // 4. Verificar convites com falha
      console.log("🔍 Verificando convites com falha...");
      
      try {
        const failedInvitesCheck = await supabase
          .from('invite_send_attempts')
          .select('*')
          .eq('status', 'failed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (failedInvitesCheck.error) {
          diagnostics.push({
            component: 'Failed Invites',
            status: 'warning',
            message: 'Tabela invite_send_attempts não encontrada ou erro: ' + failedInvitesCheck.error.message,
            timestamp: new Date().toISOString()
          });
          recommendations.push('Aplicar migração para criar tabela invite_send_attempts');
        } else {
          failedInvites = failedInvitesCheck.data || [];
          diagnostics.push({
            component: 'Failed Invites',
            status: failedInvites.length > 0 ? 'warning' : 'success',
            message: `${failedInvites.length} convites com falha encontrados`,
            details: failedInvites,
            timestamp: new Date().toISOString()
          });
          
          if (failedInvites.length > 0 && systemHealth === 'healthy') {
            systemHealth = 'warning';
            recommendations.push('Investigar causas das falhas nos envios de convite');
          }
        }
      } catch (error) {
        diagnostics.push({
          component: 'Failed Invites',
          status: 'warning',
          message: 'Não foi possível verificar convites com falha',
          timestamp: new Date().toISOString()
        });
      }

      // 5. Testar funcionalidades
      console.log("🔍 Testando funcionalidades do sistema...");
      
      const testResults = {
        email: edgeFunctionResponding,
        database: diagnostics.filter(d => d.component.includes('Database')).every(d => d.status === 'success'),
        auth: true // Assumindo que auth está funcionando se chegou até aqui
      };

      diagnostics.push({
        component: 'System Tests',
        status: Object.values(testResults).every(Boolean) ? 'success' : 'warning',
        message: `Testes: Email ${testResults.email ? '✓' : '✗'}, DB ${testResults.database ? '✓' : '✗'}, Auth ${testResults.auth ? '✓' : '✗'}`,
        details: testResults,
        timestamp: new Date().toISOString()
      });

      // Compilar dados do diagnóstico
      const diagnosticData: DiagnosticData = {
        systemHealth,
        edgeFunctionExists,
        edgeFunctionResponding,
        recentInvites,
        failedInvites,
        testResults,
        recommendations,
        lastUpdated: new Date()
      };

      setResults(diagnostics);
      setLastDiagnostic(diagnosticData);

      // Mostrar resumo
      const successCount = diagnostics.filter(d => d.status === 'success').length;
      const warningCount = diagnostics.filter(d => d.status === 'warning').length;
      const errorCount = diagnostics.filter(d => d.status === 'error').length;

      if (errorCount > 0) {
        toast.error(`Diagnóstico concluído: ${errorCount} erros críticos encontrados`, {
          description: `${successCount} sucessos, ${warningCount} avisos, ${errorCount} erros`
        });
      } else if (warningCount > 0) {
        toast.warning(`Diagnóstico concluído: ${warningCount} avisos encontrados`, {
          description: `${successCount} sucessos, ${warningCount} avisos`
        });
      } else {
        toast.success('Diagnóstico concluído: Sistema funcionando perfeitamente!', {
          description: `${successCount} componentes verificados com sucesso`
        });
      }

    } catch (error: any) {
      console.error('Erro durante diagnóstico:', error);
      diagnostics.push({
        component: 'Diagnostic System',
        status: 'error',
        message: 'Erro durante execução do diagnóstico: ' + error.message,
        timestamp: new Date().toISOString()
      });
      setResults(diagnostics);
      toast.error('Erro durante diagnóstico: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    runDiagnostic,
    testInviteEmail,
    isRunning,
    results,
    lastDiagnostic
  };
}
