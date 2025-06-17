
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export interface DiagnosticResult {
  name: string;
  success: boolean;
  message: string;
  timestamp: Date;
  details?: any;
}

export interface DiagnosticData {
  timestamp: Date;
  systemHealth: {
    email: boolean;
    database: boolean;
    auth: boolean;
  };
  // Status dos componentes principais do sistema
  edgeFunctionExists: boolean; 
  edgeFunctionResponding: boolean;
  recentInvites: any[];
  failedInvites: any[];
  // Resultados dos testes específicos
  testResults: {
    edgeFunctionTest: {
      success: boolean;
      message: string;
    };
    resendTest: {
      success: boolean;
      message: string;
    };
    fallbackTest: {
      success: boolean;
      message: string;
    };
  };
  // Recomendações baseadas na análise
  recommendations: string[];
}

export function useInviteEmailDiagnostic() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticData | null>(null);

  // Método para testar o envio de email diretamente
  const testInviteEmail = useCallback(async (email: string) => {
    try {
      setIsRunning(true);
      
      // Chamar a edge function diretamente para teste
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl: `${window.location.origin}/teste-diagnostico`,
          roleName: 'Teste Diagnóstico',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          senderName: user?.user_metadata?.name || 'Sistema de Diagnóstico',
          notes: 'Este é um email de teste do sistema de diagnóstico.',
          inviteId: 'diagnostic-test',
          forceResend: true,
          isDiagnostic: true
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: data.success,
        message: data.message || 'Email de teste enviado com sucesso',
        details: data
      };
    } catch (err: any) {
      console.error('Erro no teste de email:', err);
      return {
        success: false,
        message: err.message || 'Falha ao enviar email de teste',
        error: err
      };
    } finally {
      setIsRunning(false);
    }
  }, [user]);

  // Método principal para executar diagnóstico
  const runDiagnostic = useCallback(async () => {
    try {
      setIsRunning(true);
      setResults([]);

      const diagnosticData: DiagnosticData = {
        timestamp: new Date(),
        systemHealth: {
          email: false,
          database: false,
          auth: false
        },
        edgeFunctionExists: false,
        edgeFunctionResponding: false,
        recentInvites: [],
        failedInvites: [],
        testResults: {
          edgeFunctionTest: {
            success: false,
            message: 'Ainda não testado'
          },
          resendTest: {
            success: false,
            message: 'Ainda não testado'
          },
          fallbackTest: {
            success: false,
            message: 'Ainda não testado'
          }
        },
        recommendations: []
      };

      // Testar conexão com banco de dados
      let result = await checkDatabase();
      setResults(prev => [...prev, result]);
      diagnosticData.systemHealth.database = result.success;
      
      // Verificar se função existe
      result = await checkEdgeFunction();
      setResults(prev => [...prev, result]);
      diagnosticData.edgeFunctionExists = result.success;

      // Testar resposta da edge function
      if (diagnosticData.edgeFunctionExists) {
        result = await testEdgeFunctionResponse();
        setResults(prev => [...prev, result]);
        diagnosticData.edgeFunctionResponding = result.success;
        diagnosticData.testResults.edgeFunctionTest = {
          success: result.success,
          message: result.message
        };

        // Se edge function responde, testar Resend
        if (diagnosticData.edgeFunctionResponding) {
          result = await testResendIntegration();
          setResults(prev => [...prev, result]);
          diagnosticData.testResults.resendTest = {
            success: result.success,
            message: result.message
          };

          // Testar sistema de fallback
          result = await testFallbackSystem();
          setResults(prev => [...prev, result]);
          diagnosticData.testResults.fallbackTest = {
            success: result.success,
            message: result.message
          };
        }
      }

      // Verificar convites recentes
      const invitesResult = await checkRecentInvites();
      setResults(prev => [...prev, invitesResult.result]);
      diagnosticData.recentInvites = invitesResult.invites || [];

      // Verificar convites com erro
      const failedResult = await checkFailedInvites();
      setResults(prev => [...prev, failedResult.result]);
      diagnosticData.failedInvites = failedResult.invites || [];

      // Gerar recomendações
      diagnosticData.recommendations = generateRecommendations(diagnosticData);
      
      // Sistema geral de email está funcional se pelo menos edge function responde ou Resend está ok
      diagnosticData.systemHealth.email = 
        diagnosticData.edgeFunctionResponding && 
        (diagnosticData.testResults.resendTest.success || diagnosticData.testResults.fallbackTest.success);
      
      // Sistema de auth está funcional se DB está ok
      diagnosticData.systemHealth.auth = diagnosticData.systemHealth.database;

      // Salvar resultados
      setLastDiagnostic(diagnosticData);
      
      return diagnosticData;
    } catch (error: any) {
      console.error('Erro ao executar diagnóstico:', error);
      setResults(prev => [
        ...prev, 
        { 
          name: 'Erro de diagnóstico', 
          success: false, 
          message: error.message || 'Ocorreu um erro durante o diagnóstico',
          timestamp: new Date()
        }
      ]);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  // Funções auxiliares de diagnóstico
  const checkDatabase = async (): Promise<DiagnosticResult> => {
    try {
      // Verificar se consegue conectar ao banco fazendo uma query simples
      const { count, error } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      return {
        name: 'Conexão com banco de dados',
        success: true,
        message: 'Banco de dados respondendo normalmente',
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        name: 'Conexão com banco de dados',
        success: false,
        message: `Erro na conexão: ${err.message}`,
        timestamp: new Date()
      };
    }
  };

  const checkEdgeFunction = async (): Promise<DiagnosticResult> => {
    try {
      // Verificar se função existe chamando com um método OPTIONS
      const response = await fetch(
        `${process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invite-email`,
        { method: 'OPTIONS' }
      );
      
      // Se a função não existe, geralmente recebemos 404
      if (response.status === 404) {
        throw new Error('Função não encontrada (404)');
      }
      
      return {
        name: 'Verificação da Edge Function',
        success: true,
        message: 'Edge Function existe',
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        name: 'Verificação da Edge Function',
        success: false,
        message: `Edge Function não encontrada: ${err.message}`,
        timestamp: new Date()
      };
    }
  };
  
  const testEdgeFunctionResponse = async (): Promise<DiagnosticResult> => {
    try {
      // Chamar a edge function com parâmetro de diagnóstico
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: { 
          diagnostic: true,
          email: 'test@example.com'
        }
      });
      
      if (error) throw error;
      if (!data) throw new Error('Função não retornou dados');
      
      return {
        name: 'Resposta da Edge Function',
        success: true,
        message: 'Edge Function respondendo corretamente',
        timestamp: new Date(),
        details: data
      };
    } catch (err: any) {
      return {
        name: 'Resposta da Edge Function',
        success: false,
        message: `Erro ao chamar Edge Function: ${err.message}`,
        timestamp: new Date()
      };
    }
  };
  
  const testResendIntegration = async (): Promise<DiagnosticResult> => {
    try {
      // Testar integração com Resend via edge function
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          diagnostic: true,
          testResend: true
        }
      });
      
      if (error) throw error;
      
      const resendConfigured = data?.resendConfigured === true;
      
      return {
        name: 'Integração Resend',
        success: resendConfigured,
        message: resendConfigured 
          ? 'Resend está configurado corretamente'
          : 'Resend não está configurado ou chave API inválida',
        timestamp: new Date(),
        details: data
      };
    } catch (err: any) {
      return {
        name: 'Integração Resend',
        success: false,
        message: `Erro ao testar Resend: ${err.message}`,
        timestamp: new Date()
      };
    }
  };
  
  const testFallbackSystem = async (): Promise<DiagnosticResult> => {
    try {
      // Testar sistema de fallback
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          diagnostic: true,
          testFallback: true
        }
      });
      
      if (error) throw error;
      
      const fallbackWorking = data?.fallbackWorking === true;
      
      return {
        name: 'Sistema de Fallback',
        success: fallbackWorking,
        message: fallbackWorking 
          ? 'Sistema de fallback operacional'
          : 'Sistema de fallback não está funcionando corretamente',
        timestamp: new Date(),
        details: data
      };
    } catch (err: any) {
      return {
        name: 'Sistema de Fallback',
        success: false,
        message: `Erro ao testar fallback: ${err.message}`,
        timestamp: new Date()
      };
    }
  };
  
  const checkRecentInvites = async (): Promise<{result: DiagnosticResult, invites?: any[]}> => {
    try {
      // Buscar convites recentes
      const { data, error } = await supabase
        .from('invites')
        .select('id, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return {
        result: {
          name: 'Convites Recentes',
          success: true,
          message: `${data.length} convites recentes encontrados`,
          timestamp: new Date()
        },
        invites: data
      };
    } catch (err: any) {
      return {
        result: {
          name: 'Convites Recentes',
          success: false,
          message: `Erro ao verificar convites recentes: ${err.message}`,
          timestamp: new Date()
        },
        invites: []
      };
    }
  };
  
  const checkFailedInvites = async (): Promise<{result: DiagnosticResult, invites?: any[]}> => {
    try {
      // Buscar convites com erro
      const { data, error } = await supabase
        .from('invite_send_attempts')
        .select('id, invite_id, email, method_attempted, status, error_message, created_at')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return {
        result: {
          name: 'Convites com Erro',
          success: true,
          message: `${data.length} convites com erro encontrados`,
          timestamp: new Date()
        },
        invites: data
      };
    } catch (err: any) {
      return {
        result: {
          name: 'Convites com Erro',
          success: false,
          message: `Erro ao verificar convites com erro: ${err.message}`,
          timestamp: new Date()
        },
        invites: []
      };
    }
  };
  
  const generateRecommendations = (data: DiagnosticData): string[] => {
    const recommendations: string[] = [];
    
    if (!data.edgeFunctionExists) {
      recommendations.push('Deploy a Edge Function "send-invite-email" que está faltando.');
    }
    
    if (data.edgeFunctionExists && !data.edgeFunctionResponding) {
      recommendations.push('Verifique erros no código da Edge Function que não está respondendo corretamente.');
    }
    
    if (!data.testResults.resendTest.success) {
      recommendations.push('Configure a chave API do Resend nas variáveis de ambiente do projeto Supabase.');
    }
    
    if (!data.testResults.fallbackTest.success && !data.testResults.resendTest.success) {
      recommendations.push('Nenhum sistema de envio de email está funcionando. Configure pelo menos um método de envio.');
    }
    
    if (data.failedInvites.length > 0) {
      recommendations.push(`Existem ${data.failedInvites.length} convites com erro que precisam de atenção.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Sistema de convites funcionando corretamente! Nenhuma ação necessária.');
    }
    
    return recommendations;
  };

  return {
    runDiagnostic,
    isRunning,
    results,
    lastDiagnostic,
    testInviteEmail
  };
}
