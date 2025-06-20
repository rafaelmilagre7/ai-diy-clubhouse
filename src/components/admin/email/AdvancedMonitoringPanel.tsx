
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedEmailMonitoring } from '@/hooks/admin/email/useAdvancedEmailMonitoring';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail, 
  RefreshCw, 
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  PlayCircle,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

export const AdvancedMonitoringPanel: React.FC = () => {
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

  const handleProcessQueue = async () => {
    try {
      const result = await processEmailQueue();
      toast.success(`✅ Fila processada: ${result.successful} enviados, ${result.errors} erros`);
    } catch (error: any) {
      toast.error(`❌ Erro ao processar fila: ${error.message}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchMetrics();
      toast.success('✅ Métricas atualizadas');
    } catch (error: any) {
      toast.error(`❌ Erro ao atualizar: ${error.message}`);
    }
  };

  if (!metrics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const statusColor = {
    healthy: 'text-green-600 bg-green-100',
    degraded: 'text-yellow-600 bg-yellow-100', 
    critical: 'text-red-600 bg-red-100',
    unknown: 'text-gray-600 bg-gray-100'
  }[healthStatus.status];

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Monitoramento Avançado</h3>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate?.toLocaleTimeString() || 'Nunca'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className="flex items-center gap-1"
          >
            {isAutoRefreshEnabled ? <Pause className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
            Auto-refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcessQueue}
            className="flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            Processar Fila
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className={statusColor}>
              {healthStatus.status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
              {healthStatus.status === 'degraded' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {healthStatus.status === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
              {healthStatus.message}
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              Tempo de resposta: {metrics.performance.avg_response_time}ms
            </div>
          </div>
          
          {metrics.errors.critical_issues.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-red-600">Problemas Críticos:</h4>
              <ul className="space-y-1">
                {metrics.errors.critical_issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${metrics.performance.success_rate >= 95 ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-2xl font-bold">{metrics.performance.success_rate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Emails na Fila</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className={`h-4 w-4 ${metrics.performance.queue_length < 10 ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-2xl font-bold">{metrics.performance.queue_length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Enviados Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{metrics.statistics.emails_sent_today}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Convites Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{metrics.statistics.invites_pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Componentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Resend API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                metrics.health.resend_status === 'connected' ? 'bg-green-500' :
                metrics.health.resend_status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium capitalize">
                {metrics.health.resend_status === 'connected' ? 'Conectado' :
                 metrics.health.resend_status === 'degraded' ? 'Degradado' : 'Desconectado'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Fila de Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                metrics.health.queue_status === 'normal' ? 'bg-green-500' :
                metrics.health.queue_status === 'backed_up' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium capitalize">
                {metrics.health.queue_status === 'normal' ? 'Normal' :
                 metrics.health.queue_status === 'backed_up' ? 'Congestionada' : 'Crítica'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Edge Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                metrics.health.functions_status === 'operational' ? 'bg-green-500' :
                metrics.health.functions_status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium capitalize">
                {metrics.health.functions_status === 'operational' ? 'Operacional' :
                 metrics.health.functions_status === 'degraded' ? 'Degradadas' : 'Inativas'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
