
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, CheckCircle, Info, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  metric: string;
  currentValue: number;
  threshold: number;
}

interface AutomatedAlertsProps {
  timeRange: string;
}

export const AutomatedAlerts: React.FC<AutomatedAlertsProps> = ({ timeRange }) => {
  const [alerts, setAlerts] = React.useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Queda Significativa em Usuários Ativos',
      description: 'Usuários ativos caíram 15% nas últimas 24h. Investigar possíveis problemas técnicos.',
      timestamp: '2024-01-15T14:30:00Z',
      isRead: false,
      actionRequired: true,
      metric: 'active_users',
      currentValue: 756,
      threshold: 800
    },
    {
      id: '2',
      type: 'warning',
      title: 'Taxa de Conclusão Abaixo da Meta',
      description: 'Taxa de conclusão de implementações está 8% abaixo da meta mensal.',
      timestamp: '2024-01-15T12:15:00Z',
      isRead: false,
      actionRequired: true,
      metric: 'completion_rate',
      currentValue: 67,
      threshold: 75
    },
    {
      id: '3',
      type: 'info',
      title: 'Pico de Novos Cadastros',
      description: 'Registrados 25% mais usuários que o normal hoje. Monitorar capacidade do sistema.',
      timestamp: '2024-01-15T10:45:00Z',
      isRead: true,
      actionRequired: false,
      metric: 'new_users',
      currentValue: 45,
      threshold: 35
    }
  ]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours === 1) return 'Há 1 hora';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    return date.toLocaleDateString('pt-BR');
  };

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.isRead).length;

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-500" />
            Alertas Automáticos
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Monitoramento em tempo real das métricas críticas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum alerta ativo</p>
            <p className="text-sm text-gray-500">Todas as métricas estão dentro dos parâmetros normais</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-4 border rounded-lg transition-all",
                !alert.isRead && "border-l-4",
                alert.type === 'critical' && !alert.isRead && "border-l-red-500 bg-red-50/50",
                alert.type === 'warning' && !alert.isRead && "border-l-orange-500 bg-orange-50/50",
                alert.type === 'info' && !alert.isRead && "border-l-blue-500 bg-blue-50/50",
                alert.isRead && "border-gray-200 opacity-75"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className={cn(
                      "font-semibold",
                      !alert.isRead ? "text-gray-900" : "text-gray-600"
                    )}>
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getAlertBadgeColor(alert.type))}>
                    {alert.type.toUpperCase()}
                  </Badge>
                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{alert.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Valor atual:</span> {alert.currentValue} 
                  <span className="mx-2">|</span>
                  <span className="font-medium">Limite:</span> {alert.threshold}
                </div>
                
                {alert.actionRequired && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    🔧 Ação Necessária
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
