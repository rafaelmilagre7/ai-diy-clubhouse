
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Mail,
  Server,
  Zap,
  Clock
} from 'lucide-react';
import { useAdvancedEmailMonitoring } from '@/hooks/admin/email/useAdvancedEmailMonitoring';

export const EmailStatusMonitor: React.FC = () => {
  const {
    metrics,
    isLoading,
    lastUpdate,
    isAutoRefreshEnabled,
    fetchMetrics,
    processEmailQueue,
    toggleAutoRefresh,
    getHealthStatus
  } = useAdvancedEmailMonitoring();

  const healthStatus = getHealthStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleProcessQueue = async () => {
    try {
      await processEmailQueue();
    } catch (error) {
      console.error('Erro ao processar fila:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card className={`border-l-4 ${
        healthStatus.status === 'healthy' ? 'border-l-green-500' :
        healthStatus.status === 'degraded' ? 'border-l-yellow-500' :
        'border-l-red-500'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status do Sistema de Email
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.status)}
              <Badge className={`${
                healthStatus.status === 'healthy' ? 'bg-green-500' :
                healthStatus.status === 'degraded' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {healthStatus.message}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Resend Status */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Resend API</span>
              </div>
              <Badge variant={
                metrics?.health.resend_status === 'connected' ? 'default' :
                metrics?.health.resend_status === 'degraded' ? 'secondary' :
                'destructive'
              }>
                {metrics?.health.resend_status === 'connected' ? 'Conectado' :
                 metrics?.health.resend_status === 'degraded' ? 'Lento' :
                 'Desconectado'}
              </Badge>
            </div>

            {/* Queue Status */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Server className="h-4 w-4 text-green-500" />
                <span className="font-medium">Fila</span>
              </div>
              <Badge variant={
                metrics?.health.queue_status === 'normal' ? 'default' :
                metrics?.health.queue_status === 'backed_up' ? 'secondary' :
                'destructive'
              }>
                {metrics?.health.queue_status === 'normal' ? 'Normal' :
                 metrics?.health.queue_status === 'backed_up' ? 'Acumulada' :
                 'Crítica'}
              </Badge>
            </div>

            {/* Functions Status */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Edge Functions</span>
              </div>
              <Badge variant={
                metrics?.health.functions_status === 'operational' ? 'default' :
                metrics?.health.functions_status === 'degraded' ? 'secondary' :
                'destructive'
              }>
                {metrics?.health.functions_status === 'operational' ? 'Operacional' :
                 metrics?.health.functions_status === 'degraded' ? 'Degradado' :
                 'Falha'}
              </Badge>
            </div>

            {/* Performance */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Resposta</span>
              </div>
              <div className="text-sm font-medium">
                {metrics?.performance.avg_response_time || 0}ms
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.statistics.emails_sent_today}
                </div>
                <div className="text-sm text-muted-foreground">Enviados Hoje</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.performance.success_rate}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.statistics.emails_queued}
                </div>
                <div className="text-sm text-muted-foreground">Na Fila</div>
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

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Atualização Automática</h4>
              <p className="text-sm text-muted-foreground">
                {isAutoRefreshEnabled ? 'Monitoramento ativo (30s)' : 'Monitoramento pausado'}
              </p>
            </div>
            <Button
              onClick={toggleAutoRefresh}
              variant={isAutoRefreshEnabled ? 'default' : 'outline'}
            >
              {isAutoRefreshEnabled ? 'Pausar' : 'Ativar'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Processar Fila Manualmente</h4>
              <p className="text-sm text-muted-foreground">
                Forçar processamento de emails pendentes
              </p>
            </div>
            <Button
              onClick={handleProcessQueue}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Server className="h-4 w-4" />
              Processar Fila
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Atualizar Métricas</h4>
              <p className="text-sm text-muted-foreground">
                {lastUpdate ? `Última atualização: ${lastUpdate.toLocaleTimeString('pt-BR')}` : 'Nunca atualizado'}
              </p>
            </div>
            <Button
              onClick={fetchMetrics}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problemas Críticos */}
      {metrics?.errors.critical_issues && metrics.errors.critical_issues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Problemas Críticos Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.errors.critical_issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
