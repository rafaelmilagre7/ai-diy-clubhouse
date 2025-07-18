
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Shield, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export const SupabaseErrorDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostic = async (name: string, testFn: () => Promise<DiagnosticResult>) => {
    try {
      console.log(`🔍 [DIAGNOSTIC] Executando: ${name}`);
      const result = await testFn();
      console.log(`✅ [DIAGNOSTIC] ${name}:`, result.status);
      return result;
    } catch (error) {
      console.error(`❌ [DIAGNOSTIC] Erro em ${name}:`, error);
      return {
        name,
        status: 'error' as const,
        message: `Falha no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      };
    }
  };

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    console.log('🚀 [DIAGNOSTIC] Iniciando diagnósticos completos...');
    
    const tests: Array<() => Promise<DiagnosticResult>> = [
      // Teste 1: Conexão básica com Supabase
      async () => {
        const { data, error } = await supabase.auth.getSession();
        return {
          name: 'Conexão Supabase',
          status: error ? 'error' : 'success',
          message: error ? `Erro de conexão: ${error.message}` : 'Conexão estabelecida com sucesso',
          details: { hasSession: !!data.session }
        };
      },

      // Teste 2: Acesso à tabela user_roles
      async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select('id, name')
          .limit(5);
        
        return {
          name: 'Tabela user_roles',
          status: error ? 'error' : 'success',
          message: error 
            ? `Erro ao acessar user_roles: ${error.message}` 
            : `Tabela acessível. ${data?.length || 0} roles encontrados`,
          details: { count: data?.length || 0, error: error?.message }
        };
      },

      // Teste 3: Acesso à tabela profiles
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role_id')
          .limit(5);
        
        return {
          name: 'Tabela profiles',
          status: error ? 'error' : 'success',
          message: error 
            ? `Erro ao acessar profiles: ${error.message}` 
            : `Tabela acessível. ${data?.length || 0} perfis encontrados`,
          details: { count: data?.length || 0, error: error?.message }
        };
      },

      // Teste 4: Verificação de RLS
      async () => {
        try {
          const { data: rlsData, error: rlsError } = await supabase
            .rpc('check_system_health');
          
          return {
            name: 'Políticas RLS',
            status: rlsError ? 'warning' : 'success',
            message: rlsError 
              ? `Aviso RLS: ${rlsError.message}` 
              : 'Políticas RLS funcionando corretamente',
            details: rlsData
          };
        } catch (error) {
          return {
            name: 'Políticas RLS',
            status: 'warning',
            message: 'Função de health check não disponível',
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      },

      // Teste 5: Verificação de funções críticas
      async () => {
        try {
          const { data, error } = await supabase
            .rpc('get_cached_profile', { target_user_id: supabase.auth.getUser().then(u => u.data.user?.id) });
          
          return {
            name: 'Funções do Sistema',
            status: error ? 'warning' : 'success',
            message: error 
              ? `Algumas funções podem estar indisponíveis: ${error.message}` 
              : 'Funções principais operacionais',
            details: { profileFunction: !error }
          };
        } catch (error) {
          return {
            name: 'Funções do Sistema',
            status: 'warning',
            message: 'Erro ao testar funções do sistema',
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      }
    ];

    const results: DiagnosticResult[] = [];
    
    for (const test of tests) {
      const result = await runDiagnostic(test.name || 'Teste', test);
      results.push(result);
    }

    setDiagnostics(results);
    setLastRun(new Date());
    setIsRunning(false);
    
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (errorCount > 0) {
      toast.error(`Diagnóstico concluído: ${errorCount} erros encontrados`);
    } else if (warningCount > 0) {
      toast.warning(`Diagnóstico concluído: ${warningCount} avisos encontrados`);
    } else {
      toast.success('Diagnóstico concluído: Sistema funcionando corretamente');
    }
    
    console.log('🏁 [DIAGNOSTIC] Diagnósticos concluídos:', { errorCount, warningCount });
  };

  useEffect(() => {
    // Executar diagnósticos automaticamente ao carregar
    runAllDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    const labels = {
      success: 'OK',
      warning: 'Aviso',
      error: 'Erro'
    };

    return (
      <Badge variant={variants[status]} className="ml-2">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diagnóstico do Sistema</h2>
          <p className="text-muted-foreground">
            Verificação da saúde do sistema e conectividade com Supabase
          </p>
        </div>
        <Button onClick={runAllDiagnostics} disabled={isRunning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      {lastRun && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Último Diagnóstico: {lastRun.toLocaleString('pt-BR')}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4">
        {diagnostics.map((diagnostic, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(diagnostic.status)}
                  <span className="ml-2">{diagnostic.name}</span>
                </div>
                {getStatusBadge(diagnostic.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {diagnostic.message}
              </p>
              {diagnostic.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Detalhes técnicos
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(diagnostic.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {diagnostics.length === 0 && !isRunning && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum diagnóstico executado ainda</p>
              <p className="text-sm">Clique em "Executar Diagnóstico" para começar</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
