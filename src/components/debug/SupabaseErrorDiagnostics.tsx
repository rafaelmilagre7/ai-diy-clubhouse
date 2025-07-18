import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Wifi, 
  Shield,
  Activity,
  Server,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { RoleSyncPanel } from '@/components/admin/roles/RoleSyncPanel';
import { SystemErrorLogs } from './SystemErrorLogs';
import { ComponentHealthMonitor } from './ComponentHealthMonitor';

export const SupabaseErrorDiagnostics: React.FC = () => {
  const { healthStatus, isChecking, performHealthCheck } = useSupabaseHealthCheck();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
      case 'authenticated':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'slow':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'error':
      case 'disconnected':
      case 'unauthenticated':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
      case 'authenticated':
        return 'bg-success/10 text-success border-success/20';
      case 'slow':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
      case 'disconnected':
      case 'unauthenticated':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Status do Sistema Supabase
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real da saúde do sistema
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={healthStatus.isHealthy 
                  ? getStatusColor('operational') 
                  : getStatusColor('error')
                }
              >
                {healthStatus.isHealthy ? 'Saudável' : 'Problemas Detectados'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={performHealthCheck}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Verificando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status da Conexão */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Wifi className="h-6 w-6 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus.connectionStatus)}
                  <span className="font-medium">Conexão</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {healthStatus.connectionStatus}
                </p>
              </div>
            </div>

            {/* Status da Autenticação */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus.authStatus)}
                  <span className="font-medium">Autenticação</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {healthStatus.authStatus}
                </p>
              </div>
            </div>

            {/* Status do Banco */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Database className="h-6 w-6 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus.databaseStatus)}
                  <span className="font-medium">Banco de Dados</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {healthStatus.databaseStatus}
                </p>
              </div>
            </div>

            {/* Status do Storage */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Server className="h-6 w-6 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus.storageStatus)}
                  <span className="font-medium">Storage</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {healthStatus.storageStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Problemas Detectados */}
          {healthStatus.issues.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Problemas Detectados:</h4>
              <div className="space-y-2">
                {healthStatus.issues.map((issue, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{issue}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Informações do Sistema</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Políticas RLS:</span>
                <span className="ml-2 font-mono">{healthStatus.rlsPoliciesCount || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Funções:</span>
                <span className="ml-2 font-mono">{healthStatus.functionsCount || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tabelas:</span>
                <span className="ml-2 font-mono">{healthStatus.tablesCount || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Storage Buckets:</span>
                <span className="ml-2 font-mono">{healthStatus.storageBuckets || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Última Verificação */}
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            Última verificação: {healthStatus.checkedAt.toLocaleString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      {/* Abas de Diagnóstico */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">Sistema & Performance</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissões</TabsTrigger>
          <TabsTrigger value="logs">Logs de Erro</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico do Sistema</CardTitle>
              <CardDescription>
                Análise detalhada de performance e conectividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <span>Status da API</span>
                  <Badge className={getStatusColor(healthStatus.databaseStatus)}>
                    {healthStatus.databaseStatus}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <span>Latência da Conexão</span>
                  <Badge className={getStatusColor(healthStatus.connectionStatus)}>
                    {healthStatus.connectionStatus === 'slow' ? 'Alta' : 'Normal'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <span>Políticas RLS</span>
                  <Badge className={getStatusColor('operational')}>
                    {healthStatus.rlsPoliciesCount || 0} Ativas
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <span>Views Analíticas</span>
                  <Badge className={getStatusColor('operational')}>
                    Disponíveis
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <ComponentHealthMonitor />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleSyncPanel />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <SystemErrorLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};