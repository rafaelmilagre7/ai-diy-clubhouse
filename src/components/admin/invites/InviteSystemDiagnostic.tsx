
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, Tabs Content, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Mail,
  Settings,
  Database,
  Zap,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';
import { toast } from 'sonner';

const InviteSystemDiagnostic: React.FC = () => {
  const { runDiagnostic, isRunning, lastDiagnostic } = useInviteEmailDiagnostic();
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleRunDiagnostic = async () => {
    try {
      await runDiagnostic();
      toast.success('Diagnóstico concluído!');
    } catch (error) {
      toast.error('Erro ao executar diagnóstico');
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'warning' | 'error') => {
    const variants = {
      success: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      warning: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      error: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };
    
    return variants[status] || variants.error;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico do Sistema de Convites</h2>
          <p className="text-muted-foreground">
            Monitore a saúde e performance do sistema de envio de convites
          </p>
        </div>
        <Button 
          onClick={handleRunDiagnostic}
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
          {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      {lastDiagnostic && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
            <TabsTrigger value="tests">Testes de Conectividade</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                  {getStatusIcon(lastDiagnostic.systemHealth.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lastDiagnostic.systemHealth.status === 'healthy' ? 'Saudável' : 
                     lastDiagnostic.systemHealth.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Última verificação: {new Date(lastDiagnostic.checkedAt).toLocaleString('pt-BR')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Convites Recentes</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lastDiagnostic.recentInvites.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 10 convites criados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Convites Falhados</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {lastDiagnostic.failedInvites.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requerem atenção
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recomendações do Sistema
                </CardTitle>
                <CardDescription>
                  Sugestões para otimizar o desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lastDiagnostic.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {/* Component Health Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Banco de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Conectividade</span>
                    <Badge 
                      {...getStatusBadge(lastDiagnostic.systemHealth.database ? 'success' : 'error')}
                    >
                      {lastDiagnostic.systemHealth.database ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Autenticação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Sistema Auth</span>
                    <Badge 
                      {...getStatusBadge(lastDiagnostic.systemHealth.auth ? 'success' : 'error')}
                    >
                      {lastDiagnostic.systemHealth.auth ? 'Funcionando' : 'Com problemas'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Sistema de Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Serviço Resend</span>
                    <Badge 
                      {...getStatusBadge(lastDiagnostic.systemHealth.email ? 'success' : 'error')}
                    >
                      {lastDiagnostic.systemHealth.email ? 'Operacional' : 'Indisponível'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Edge Functions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Função Disponível</span>
                      <Badge 
                        {...getStatusBadge(lastDiagnostic.edgeFunctionExists ? 'success' : 'error')}
                      >
                        {lastDiagnostic.edgeFunctionExists ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Respondendo</span>
                      <Badge 
                        {...getStatusBadge(lastDiagnostic.edgeFunctionResponding ? 'success' : 'error')}
                      >
                        {lastDiagnostic.edgeFunctionResponding ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            {/* Connectivity Tests */}
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(lastDiagnostic.testResults).map(([testName, result]) => (
                <Card key={testName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">
                        {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <Badge {...getStatusBadge(result.status)}>
                        {result.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.message}
                    </p>
                    {result.test && (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Teste: {result.test}
                      </code>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Recent Invites */}
            <Card>
              <CardHeader>
                <CardTitle>Convites Recentes</CardTitle>
                <CardDescription>
                  Últimos 10 convites criados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lastDiagnostic.recentInvites.length > 0 ? (
                  <div className="space-y-2">
                    {lastDiagnostic.recentInvites.map((invite, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{invite.email}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(invite.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <Badge variant={invite.used_at ? 'default' : 'secondary'}>
                          {invite.used_at ? 'Usado' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum convite encontrado</p>
                )}
              </CardContent>
            </Card>

            {/* Failed Invites */}
            {lastDiagnostic.failedInvites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Convites com Problemas
                  </CardTitle>
                  <CardDescription>
                    Convites que requerem atenção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lastDiagnostic.failedInvites.map((invite, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded border-red-200 bg-red-50">
                        <div>
                          <span className="font-medium">{invite.email}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Sem tentativas de envio
                          </span>
                        </div>
                        <Badge variant="destructive">
                          Falhou
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!lastDiagnostic && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Diagnóstico não executado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Execute o diagnóstico para verificar a saúde do sistema de convites
            </p>
            <Button onClick={handleRunDiagnostic} disabled={isRunning}>
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Executar Primeiro Diagnóstico
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InviteSystemDiagnostic;
