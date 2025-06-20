
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Activity,
  Mail,
  Clock
} from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { ResendDiagnostics } from './ResendDiagnostics';

export const SupabaseErrorDiagnostics: React.FC = () => {
  const { healthStatus, isChecking, performHealthCheck } = useSupabaseHealthCheck();
  const { healthStatus: resendHealth, isChecking: isCheckingResend } = useResendHealthCheck();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':  
      case 'operational':
        return 'bg-green-500';
      case 'slow':
        return 'bg-yellow-500';
      case 'disconnected':
      case 'unauthenticated':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'disconnected':
      case 'unauthenticated':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'slow': return 'Lento';
      case 'authenticated': return 'Autenticado';
      case 'unauthenticated': return 'Não Autenticado';
      case 'operational': return 'Operacional';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento da saúde dos serviços essenciais
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={performHealthCheck} 
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="supabase" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase
          </TabsTrigger>
          <TabsTrigger value="resend" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sistema de Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supabase" className="space-y-4">
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status Geral do Sistema
              </CardTitle>
              <CardDescription>
                Última verificação: {formatDate(healthStatus.checkedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-3 h-3 rounded-full ${healthStatus.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {healthStatus.isHealthy ? 'Sistema Saudável' : 'Problemas Detectados'}
                </span>
              </div>
              
              {healthStatus.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Problemas identificados:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {healthStatus.issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conexão */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(healthStatus.connectionStatus)}
                  Conexão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className={`${getStatusColor(healthStatus.connectionStatus)} text-white`}>
                    {getStatusText(healthStatus.connectionStatus)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Conectividade com o servidor
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Banco de Dados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(healthStatus.databaseStatus)}
                  Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className={`${getStatusColor(healthStatus.databaseStatus)} text-white`}>
                    {getStatusText(healthStatus.databaseStatus)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Operações de banco de dados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Autenticação */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(healthStatus.authStatus)}
                  Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className={`${getStatusColor(healthStatus.authStatus)} text-white`}>
                    {getStatusText(healthStatus.authStatus)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Sistema de autenticação
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card className="md:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(healthStatus.storageStatus)}
                  Armazenamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className={`${getStatusColor(healthStatus.storageStatus)} text-white`}>
                    {getStatusText(healthStatus.storageStatus)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Sistema de armazenamento de arquivos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resend" className="space-y-4">
          <ResendDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
