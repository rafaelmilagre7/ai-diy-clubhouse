
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, RefreshCw, ExternalLink, Copy, Database, Shield, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  timestamp: Date;
}

interface DebugInfo {
  supabaseUrl: string;
  supabaseKey: string;
  isConnected: boolean;
  error?: string;
  timestamp: Date;
}

export const SupabaseErrorDiagnostics: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];
    
    try {
      // Test 1: Check Supabase Connection
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          results.push({
            name: 'Conexão Supabase',
            status: 'error',
            message: 'Falha na conexão com o Supabase',
            details: error.message,
            timestamp: new Date()
          });
        } else {
          results.push({
            name: 'Conexão Supabase',
            status: 'success',
            message: 'Conexão estabelecida com sucesso',
            timestamp: new Date()
          });
        }
      } catch (err: any) {
        results.push({
          name: 'Conexão Supabase',
          status: 'error',
          message: 'Erro crítico de conexão',
          details: err.message,
          timestamp: new Date()
        });
      }

      // Test 2: Authentication Status
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          results.push({
            name: 'Status de Autenticação',
            status: 'warning',
            message: 'Erro ao verificar usuário',
            details: error.message,
            timestamp: new Date()
          });
        } else if (user) {
          results.push({
            name: 'Status de Autenticação',
            status: 'success',
            message: `Usuário autenticado: ${user.email}`,
            timestamp: new Date()
          });
        } else {
          results.push({
            name: 'Status de Autenticação',
            status: 'warning',
            message: 'Nenhum usuário autenticado',
            timestamp: new Date()
          });
        }
      } catch (err: any) {
        results.push({
          name: 'Status de Autenticação',
          status: 'error',
          message: 'Erro ao verificar autenticação',
          details: err.message,
          timestamp: new Date()
        });
      }

      // Test 3: RLS Policies Check
      try {
        const { data, error } = await supabase.rpc('check_rls_status');
        
        if (error) {
          results.push({
            name: 'Políticas RLS',
            status: 'warning',
            message: 'Não foi possível verificar RLS',
            details: error.message,
            timestamp: new Date()
          });
        } else if (data) {
          const unsecuredTables = data.filter((table: any) => table.security_status === '🔴 SEM PROTEÇÃO');
          
          if (unsecuredTables.length > 0) {
            results.push({
              name: 'Políticas RLS',
              status: 'warning',
              message: `${unsecuredTables.length} tabela(s) sem proteção RLS`,
              details: `Tabelas: ${unsecuredTables.map((t: any) => t.table_name).join(', ')}`,
              timestamp: new Date()
            });
          } else {
            results.push({
              name: 'Políticas RLS',
              status: 'success',
              message: 'Todas as tabelas estão protegidas',
              timestamp: new Date()
            });
          }
        }
      } catch (err: any) {
        results.push({
          name: 'Políticas RLS',
          status: 'error',
          message: 'Erro ao verificar políticas RLS',
          details: err.message,
          timestamp: new Date()
        });
      }

      // Test 4: Database Functions
      try {
        const { data, error } = await supabase.rpc('get_current_user_role');
        
        if (error) {
          results.push({
            name: 'Funções do Banco',
            status: 'error',
            message: 'Erro ao executar função de teste',
            details: error.message,
            timestamp: new Date()
          });
        } else {
          results.push({
            name: 'Funções do Banco',
            status: 'success',
            message: 'Funções funcionando corretamente',
            details: `Papel atual: ${data || 'não definido'}`,
            timestamp: new Date()
          });
        }
      } catch (err: any) {
        results.push({
          name: 'Funções do Banco',
          status: 'error',
          message: 'Erro crítico nas funções',
          details: err.message,
          timestamp: new Date()
        });
      }

      // Test 5: Storage Access
      try {
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          results.push({
            name: 'Acesso ao Storage',
            status: 'error',
            message: 'Erro ao acessar storage',
            details: error.message,
            timestamp: new Date()
          });
        } else {
          results.push({
            name: 'Acesso ao Storage',
            status: 'success',
            message: `${data.length} bucket(s) acessível(is)`,
            details: data.map(b => b.name).join(', '),
            timestamp: new Date()
          });
        }
      } catch (err: any) {
        results.push({
          name: 'Acesso ao Storage',
          status: 'error',
          message: 'Erro crítico no storage',
          details: err.message,
          timestamp: new Date()
        });
      }

      setTests(results);
      setLastRun(new Date());

      // Update debug info
      setDebugInfo({
        supabaseUrl: supabase.supabaseUrl,
        supabaseKey: supabase.supabaseKey.substring(0, 20) + '...',
        isConnected: results.some(r => r.name === 'Conexão Supabase' && r.status === 'success'),
        timestamp: new Date()
      });

    } catch (error: any) {
      console.error('Erro durante diagnósticos:', error);
      results.push({
        name: 'Erro Geral',
        status: 'error',
        message: 'Erro durante execução dos testes',
        details: error.message,
        timestamp: new Date()
      });
      setTests(results);
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const exportDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      tests: tests,
      debugInfo: debugInfo,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-diagnostics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sucesso</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Aviso</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico do Supabase</h2>
          <p className="text-muted-foreground">
            Verificação da saúde e conectividade do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </Button>
          <Button 
            onClick={exportDiagnostics}
            disabled={tests.length === 0}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {lastRun && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Última execução: {lastRun.toLocaleString('pt-BR')}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">
            <Shield className="h-4 w-4 mr-2" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="info">
            <Database className="h-4 w-4 mr-2" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="quick">
            <Zap className="h-4 w-4 mr-2" />
            Ações Rápidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {tests.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum teste executado ainda</p>
                  <Button 
                    onClick={runDiagnostics} 
                    className="mt-4"
                    disabled={isRunning}
                  >
                    {isRunning ? 'Executando...' : 'Executar Diagnósticos'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tests.map((test, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <CardTitle className="text-base">{test.name}</CardTitle>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{test.message}</p>
                    {test.details && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground font-mono">
                          {test.details}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {test.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          {debugInfo ? (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conexão</CardTitle>
                <CardDescription>
                  Detalhes da configuração atual do Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">URL do Supabase</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted p-2 rounded flex-1">
                        {debugInfo.supabaseUrl}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(debugInfo.supabaseUrl)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Chave Anônima</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted p-2 rounded flex-1">
                        {debugInfo.supabaseKey}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(debugInfo.supabaseKey)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Status da Conexão</label>
                    <div className="flex items-center gap-2 mt-1">
                      {debugInfo.isConnected ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Desconectado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Última Verificação</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {debugInfo.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Execute os diagnósticos para ver as informações</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Limpar Cache do Auth</CardTitle>
                <CardDescription>
                  Remove dados de autenticação em cache
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    toast.success('Cache limpo com sucesso');
                  }}
                >
                  Limpar Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Forçar Logout</CardTitle>
                <CardDescription>
                  Desconecta o usuário atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success('Logout realizado');
                    window.location.reload();
                  }}
                >
                  Fazer Logout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verificar Conexão</CardTitle>
                <CardDescription>
                  Testa conectividade básica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.from('profiles').select('count').limit(1);
                      if (error) throw error;
                      toast.success('Conexão OK');
                    } catch (err) {
                      toast.error('Erro na conexão');
                    }
                  }}
                >
                  Testar Conexão
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurar Storage</CardTitle>
                <CardDescription>
                  Configura buckets de storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
                      if (error) throw error;
                      toast.success('Storage configurado');
                    } catch (err) {
                      toast.error('Erro ao configurar storage');
                    }
                  }}
                >
                  Configurar Storage
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
