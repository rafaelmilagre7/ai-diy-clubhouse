
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Shield, 
  Activity,
  Info,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RLSStatus {
  table_name: string;
  rls_enabled: boolean;
  has_policies: boolean;
  policy_count: number;
  security_status: string;
}

interface DebugInfo {
  timestamp: string;
  supabaseUrl: string;
  hasValidConnection: boolean;
  environment: string;
  userAgent: string;
}

interface ConnectionTest {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const SupabaseErrorDiagnostics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rlsStatus, setRlsStatus] = useState<RLSStatus[]>([]);
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test 1: Basic connection
      const connectionTest = await testConnection();
      
      // Test 2: RLS Status
      const rlsTest = await testRLSStatus();
      
      // Test 3: Auth status
      const authTest = await testAuth();
      
      // Test 4: Database access
      const dbTest = await testDatabaseAccess();
      
      setConnectionTests([connectionTest, rlsTest, authTest, dbTest]);
      
      // Generate debug info
      const info: DebugInfo = {
        timestamp: new Date().toISOString(),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co',
        hasValidConnection: connectionTest.status === 'success',
        environment: import.meta.env.MODE || 'development',
        userAgent: navigator.userAgent.substring(0, 100)
      };
      
      setDebugInfo(info);
      
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setError(`Erro durante diagnóstico: ${err.message}`);
      toast.error('Erro ao executar diagnósticos');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (): Promise<ConnectionTest> => {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        return {
          name: 'Conexão com Supabase',
          status: 'error',
          message: `Erro de conexão: ${error.message}`,
          details: error
        };
      }
      
      return {
        name: 'Conexão com Supabase',
        status: 'success',
        message: 'Conexão estabelecida com sucesso'
      };
    } catch (err: any) {
      return {
        name: 'Conexão com Supabase',
        status: 'error',
        message: `Falha na conexão: ${err.message}`,
        details: err
      };
    }
  };

  const testRLSStatus = async (): Promise<ConnectionTest> => {
    try {
      const { data, error } = await supabase.rpc('check_rls_status');
      
      if (error) {
        return {
          name: 'Status RLS',
          status: 'error',
          message: `Erro ao verificar RLS: ${error.message}`,
          details: error
        };
      }
      
      if (data) {
        // Tratar o resultado como array
        const rlsData = Array.isArray(data) ? data : [data];
        const unsafeTables = (rlsData as any[]).filter((table: any) => 
          table.security_status === '🔴 SEM PROTEÇÃO'
        );
        
        setRlsStatus(rlsData as any);
        
        return {
          name: 'Status RLS',
          status: unsafeTables.length > 0 ? 'warning' : 'success',
          message: unsafeTables.length > 0 
            ? `${unsafeTables.length} tabelas sem proteção RLS`
            : 'Todas as tabelas protegidas',
          details: { unsafeTables: unsafeTables.length, total: rlsData.length }
        };
      }
      
      return {
        name: 'Status RLS',
        status: 'warning',
        message: 'Nenhum dado retornado da verificação RLS'
      };
    } catch (err: any) {
      return {
        name: 'Status RLS',
        status: 'error',
        message: `Erro ao verificar RLS: ${err.message}`,
        details: err
      };
    }
  };

  const testAuth = async (): Promise<ConnectionTest> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return {
          name: 'Autenticação',
          status: 'warning',
          message: `Usuário não autenticado: ${error.message}`,
          details: error
        };
      }
      
      return {
        name: 'Autenticação',
        status: user ? 'success' : 'warning',
        message: user ? `Usuário autenticado: ${user.email}` : 'Usuário não autenticado',
        details: { userId: user?.id, email: user?.email }
      };
    } catch (err: any) {
      return {
        name: 'Autenticação',
        status: 'error',
        message: `Erro na autenticação: ${err.message}`,
        details: err
      };
    }
  };

  const testDatabaseAccess = async (): Promise<ConnectionTest> => {
    try {
      // Testar acesso a uma tabela simples
      const { data, error } = await supabase
        .from('user_roles')
        .select('name')
        .limit(1);
      
      if (error) {
        return {
          name: 'Acesso ao Banco',
          status: 'error',
          message: `Erro de acesso: ${error.message}`,
          details: error
        };
      }
      
      return {
        name: 'Acesso ao Banco',
        status: 'success',
        message: 'Acesso ao banco funcionando',
        details: { recordsFound: data?.length || 0 }
      };
    } catch (err: any) {
      return {
        name: 'Acesso ao Banco',
        status: 'error',
        message: `Falha no acesso: ${err.message}`,
        details: err
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const exportDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      debugInfo,
      connectionTests,
      rlsStatus,
      error,
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Informações de debug exportadas');
  };

  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento e diagnóstico da saúde do sistema Supabase
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={exportDebugInfo}
            variant="outline"
            disabled={!debugInfo}
          >
            Exportar Debug
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rls">Segurança RLS</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Testes de Conexão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectionTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.message}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status de Segurança RLS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rlsStatus.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tabela</th>
                        <th className="text-left p-2">RLS Ativo</th>
                        <th className="text-left p-2">Políticas</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rlsStatus.map((table, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono text-sm">{table.table_name}</td>
                          <td className="p-2">
                            {table.rls_enabled ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <XCircle className="h-4 w-4 text-red-500" />
                            }
                          </td>
                          <td className="p-2">{table.policy_count}</td>
                          <td className="p-2">{table.security_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Execute o diagnóstico para ver o status RLS</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informações de Debug
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Configuração</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>URL:</strong> {debugInfo.supabaseUrl}</p>
                        <p><strong>Ambiente:</strong> {debugInfo.environment}</p>
                        <p><strong>Conexão:</strong> {debugInfo.hasValidConnection ? 'Ativa' : 'Inativa'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Sistema</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Timestamp:</strong> {new Date(debugInfo.timestamp).toLocaleString()}</p>
                        <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Raw Debug Data</h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64">
                      {JSON.stringify({ debugInfo, connectionTests, rlsStatus }, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Execute o diagnóstico para ver as informações de debug</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
