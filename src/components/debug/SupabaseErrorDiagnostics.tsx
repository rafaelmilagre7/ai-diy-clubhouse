import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useSecurityStatus } from '@/hooks/admin/useSecurityStatus';
import { Shield, AlertTriangle, CheckCircle, XCircle, Database, Key, Activity, RefreshCw, Server, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
interface DiagnosticResult {
  category: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}
interface ConnectionInfo {
  status: 'connected' | 'disconnected' | 'error';
  url?: string;
  region?: string;
  version?: string;
}
interface RLSStatus {
  table_name: string;
  rls_enabled: boolean;
  has_policies: boolean;
  policy_count: number;
  security_status: string;
}
export const SupabaseErrorDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'disconnected'
  });
  const [progress, setProgress] = useState(0);
  const {
    isLoading: securityLoading,
    securityData,
    error: securityError,
    checkSecurityStatus
  } = useSecurityStatus();
  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    const results: DiagnosticResult[] = [];
    try {
      // 1. Teste de Conexão Básica
      setProgress(20);
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('count', {
          count: 'exact',
          head: true
        });
        if (error) throw error;
        results.push({
          category: 'Conexão',
          status: 'success',
          message: 'Conexão com Supabase estabelecida com sucesso',
          details: {
            recordCount: data
          }
        });
        setConnectionInfo({
          status: 'connected',
          url: 'Conectado com sucesso',
          region: 'Supabase Cloud',
          version: 'Última'
        });
      } catch (error: any) {
        results.push({
          category: 'Conexão',
          status: 'error',
          message: `Falha na conexão: ${error.message}`,
          details: error
        });
        setConnectionInfo({
          status: 'error'
        });
      }

      // 2. Teste de Autenticação
      setProgress(40);
      try {
        const {
          data: {
            session
          },
          error
        } = await supabase.auth.getSession();
        if (error) throw error;
        results.push({
          category: 'Autenticação',
          status: session ? 'success' : 'warning',
          message: session ? 'Usuário autenticado' : 'Nenhum usuário logado',
          details: {
            hasSession: !!session,
            userId: session?.user?.id
          }
        });
      } catch (error: any) {
        results.push({
          category: 'Autenticação',
          status: 'error',
          message: `Erro na autenticação: ${error.message}`,
          details: error
        });
      }

      // 3. Teste de Políticas RLS
      setProgress(60);
      try {
        await checkSecurityStatus();
        const criticalTables = (securityData as any[]).filter(row => row.security_status.includes('SEM PROTEÇÃO'));
        results.push({
          category: 'Segurança RLS',
          status: criticalTables.length === 0 ? 'success' : 'error',
          message: criticalTables.length === 0 ? 'Todas as tabelas estão protegidas por RLS' : `${criticalTables.length} tabelas sem proteção RLS`,
          details: {
            criticalCount: criticalTables.length,
            totalTables: securityData.length
          }
        });
      } catch (error: any) {
        results.push({
          category: 'Segurança RLS',
          status: 'error',
          message: `Erro ao verificar RLS: ${error.message}`,
          details: error
        });
      }

      // 4. Teste de Operações CRUD
      setProgress(80);
      try {
        // Teste simples de leitura em uma tabela pública
        const {
          data,
          error
        } = await supabase.from('forum_categories').select('id').limit(1);
        if (error) throw error;
        results.push({
          category: 'Operações CRUD',
          status: 'success',
          message: 'Operações de leitura funcionando corretamente',
          details: {
            canRead: true
          }
        });
      } catch (error: any) {
        results.push({
          category: 'Operações CRUD',
          status: 'error',
          message: `Erro nas operações CRUD: ${error.message}`,
          details: error
        });
      }
      setProgress(100);
      setDiagnostics(results);
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      if (errorCount === 0 && warningCount === 0) {
        toast.success('🎉 Todos os diagnósticos passaram!');
      } else if (errorCount === 0) {
        toast.warning(`⚠️ ${warningCount} avisos encontrados`);
      } else {
        toast.error(`❌ ${errorCount} erros críticos encontrados`);
      }
    } catch (error: any) {
      console.error('Erro durante diagnósticos:', error);
      toast.error('Erro durante a execução dos diagnósticos');
    } finally {
      setIsRunning(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>;
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Diagnóstico do Supabase
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verificação completa da saúde da conexão e configurações
              </p>
            </div>
            <Button onClick={runDiagnostics} disabled={isRunning} className="min-w-[120px]">
              {isRunning ? <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </> : <>
                  <Activity className="mr-2 h-4 w-4" />
                  Executar Diagnóstico
                </>}
            </Button>
          </div>
        </CardHeader>

        {isRunning && <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do diagnóstico</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>}
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Diagnósticos</CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostics.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum diagnóstico executado ainda</p>
                  <p className="text-sm">Clique em "Executar Diagnóstico" para começar</p>
                </div> : <div className="space-y-4">
                  {diagnostics.map((result, index) => <Alert key={index} className="">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{result.category}</h4>
                            {getStatusBadge(result.status)}
                          </div>
                          <AlertDescription className="mt-1">
                            {result.message}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Status da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {connectionInfo.status === 'connected' ? <CheckCircle className="h-5 w-5 text-green-500" /> : connectionInfo.status === 'error' ? <XCircle className="h-5 w-5 text-red-500" /> : <Activity className="h-5 w-5 text-gray-500" />}
                    <div>
                      <p className="font-medium">Status da Conexão</p>
                      <p className="text-sm text-muted-foreground">
                        {connectionInfo.status === 'connected' ? 'Conectado' : connectionInfo.status === 'error' ? 'Erro na conexão' : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(connectionInfo.status === 'connected' ? 'success' : 'error')}
                </div>

                {connectionInfo.url && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm">URL do Projeto</p>
                      <p className="text-xs text-muted-foreground">Conectado</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm">Região</p>
                      <p className="text-xs text-muted-foreground">{connectionInfo.region}</p>
                    </div>
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status de Segurança (RLS)
                </CardTitle>
                <Button onClick={checkSecurityStatus} disabled={securityLoading} variant="outline" size="sm">
                  {securityLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {securityError ? <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro ao verificar status de segurança: {securityError}
                  </AlertDescription>
                </Alert> : securityData.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado de segurança disponível</p>
                  <p className="text-sm">Execute o diagnóstico para verificar o RLS</p>
                </div> : <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Seguras</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {securityData.filter(row => row.security_status.includes('SEGURO')).length}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">RLS Desabilitado</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {securityData.filter(row => row.security_status.includes('RLS DESABILITADO')).length}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Sem Proteção</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">
                        {securityData.filter(row => row.security_status.includes('SEM PROTEÇÃO')).length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {securityData.map((row, index) => <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <span className="font-medium">{row.table_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({row.policy_count} políticas)
                          </span>
                        </div>
                        <Badge variant={row.security_status.includes('SEGURO') ? 'default' : row.security_status.includes('RLS DESABILITADO') ? 'secondary' : 'destructive'}>
                          {row.security_status}
                        </Badge>
                      </div>)}
                  </div>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Detalhes Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostics.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum detalhe técnico disponível</p>
                  <p className="text-sm">Execute o diagnóstico primeiro</p>
                </div> : <div className="space-y-4">
                  {diagnostics.map((result, index) => <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {result.category}
                        </h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{result.message}</p>
                      {result.details && <details className="text-sm">
                          <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                            Ver detalhes técnicos
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>}
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};