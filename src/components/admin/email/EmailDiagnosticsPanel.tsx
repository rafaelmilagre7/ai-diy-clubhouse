
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Mail,
  Server,
  Database,
  Zap
} from 'lucide-react';
import { useAdvancedEmailMonitoring } from '@/hooks/admin/email/useAdvancedEmailMonitoring';

export const EmailDiagnosticsPanel: React.FC = () => {
  const {
    metrics,
    isLoading,
    lastUpdate,
    fetchMetrics,
    processEmailQueue,
    getHealthStatus
  } = useAdvancedEmailMonitoring();

  const handleProcessQueue = async () => {
    try {
      await processEmailQueue();
    } catch (error) {
      console.error('Erro ao processar fila:', error);
    }
  };

  const healthStatus = getHealthStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
      case 'backed_up':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
      case 'normal':
        return <Badge className="bg-green-500">Operacional</Badge>;
      case 'degraded':
      case 'backed_up':
        return <Badge variant="secondary">Degradado</Badge>;
      case 'down':
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Status do Sistema de Email
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`bg-${healthStatus.color}-500`}>
              {healthStatus.message}
            </Badge>
            <Button
              onClick={fetchMetrics}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Resend Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Resend API</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.health.resend_status)}
                  {getStatusBadge(metrics.health.resend_status)}
                </div>
              </div>

              {/* Queue Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Fila de Email</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.health.queue_status)}
                  {getStatusBadge(metrics.health.queue_status)}
                </div>
              </div>

              {/* Functions Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Edge Functions</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.health.functions_status)}
                  {getStatusBadge(metrics.health.functions_status)}
                </div>
              </div>

              {/* Overall Health */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Status Geral</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.health.overall)}
                  {getStatusBadge(metrics.health.overall)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando métricas do sistema...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.statistics.emails_sent_today}
                </div>
                <div className="text-sm text-muted-foreground">Enviados Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.statistics.emails_queued}
                </div>
                <div className="text-sm text-muted-foreground">Na Fila</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.statistics.emails_failed}
                </div>
                <div className="text-sm text-muted-foreground">Falharam</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.statistics.invites_pending}
                </div>
                <div className="text-sm text-muted-foreground">Convites Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {metrics.performance.avg_response_time}ms
                </div>
                <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.performance.success_rate}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {metrics.performance.processing_rate}
                </div>
                <div className="text-sm text-muted-foreground">Emails/min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleProcessQueue}
            className="w-full"
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            Processar Fila de Email Manualmente
          </Button>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p><strong>Última atualização:</strong> {lastUpdate?.toLocaleString('pt-BR') || 'Nunca'}</p>
            <p><strong>Monitoramento:</strong> Automático a cada 30 segundos</p>
          </div>

          {/* Erros Críticos */}
          {metrics && metrics.errors.critical_issues.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Problemas detectados:</strong>
                <ul className="mt-2 space-y-1">
                  {metrics.errors.critical_issues.map((issue, index) => (
                    <li key={index} className="text-sm">• {issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
