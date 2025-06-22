
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Signal,
  TrendingUp,
  XCircle,
  Bell,
  BellOff
} from 'lucide-react';
import { useRealTimeMonitoring } from '@/hooks/admin/invites/useRealTimeMonitoring';

export const RealTimeMonitoring: React.FC = () => {
  const { 
    metrics, 
    alerts, 
    isConnected, 
    acknowledgeAlert, 
    clearAlerts, 
    refreshMetrics 
  } = useRealTimeMonitoring();

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header com Status de Conexão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Monitoramento em Tempo Real</h2>
          <div className="flex items-center gap-2">
            <Signal className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </div>
        
        <Button onClick={refreshMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Convites Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeInvites}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{metrics.pendingDeliveries}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold">{metrics.failedDeliveries}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${getHealthColor(metrics.systemHealth)}`}>
                {getHealthIcon(metrics.systemHealth)}
                <div>
                  <p className="font-semibold capitalize">{metrics.systemHealth}</p>
                  <p className="text-sm opacity-75">
                    Sistema funcionando {metrics.systemHealth === 'healthy' ? 'normalmente' : 
                    metrics.systemHealth === 'warning' ? 'com avisos' : 'com problemas críticos'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tempo de Resposta</p>
                  <p className="font-semibold">{metrics.avgResponseTime.toFixed(0)}ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Atualização</p>
                  <p className="font-semibold">Agora</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas
                {unacknowledgedAlerts.length > 0 && (
                  <Badge variant="destructive">{unacknowledgedAlerts.length}</Badge>
                )}
              </CardTitle>
              {alerts.length > 0 && (
                <Button onClick={clearAlerts} variant="outline" size="sm">
                  <BellOff className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {alerts.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-center">
                  <div className="text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum alerta</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.acknowledged ? 'opacity-50' : ''
                      } ${
                        alert.type === 'error' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            onClick={() => acknowledgeAlert(alert.id)}
                            variant="ghost"
                            size="sm"
                          >
                            OK
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
