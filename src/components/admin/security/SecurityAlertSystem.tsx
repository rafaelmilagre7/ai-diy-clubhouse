
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Shield, Clock, Check, X } from 'lucide-react';

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_type: string; // Renomeado de 'type' para 'alert_type'
  created_at: string;
  is_acknowledged: boolean;
  data?: Record<string, any>;
}

interface SecurityAlertSystemProps {
  alerts: AlertNotification[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export const SecurityAlertSystem = ({ alerts, onAcknowledge, onDismiss }: SecurityAlertSystemProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'severity'>('created_at');

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alert.is_acknowledged;
    return alert.severity === filter;
  });

  // Ordenar alertas
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'security_breach':
        return <AlertTriangle className="h-5 w-5 text-severity-critical" />;
      case 'anomaly_detected':
        return <Shield className="h-5 w-5 text-severity-medium" />;
      case 'system_alert':
        return <Bell className="h-5 w-5 text-severity-low" />;
      default:
        return <Bell className="h-5 w-5 text-severity-info" />;
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.is_acknowledged).length;
  const unacknowledgedCount = alerts.filter(a => !a.is_acknowledged).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Sistema de Alertas de Segurança
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} críticos</Badge>
            )}
          </div>
          <Badge variant="secondary">{unacknowledgedCount} não reconhecidos</Badge>
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({alerts.length})
          </Button>
          <Button
            variant={filter === 'unacknowledged' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unacknowledged')}
          >
            Não Reconhecidos ({unacknowledgedCount})
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            Críticos ({alerts.filter(a => a.severity === 'critical').length})
          </Button>
          <Button
            variant={filter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('high')}
          >
            Altos ({alerts.filter(a => a.severity === 'high').length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.is_acknowledged ? 'bg-muted/30' : 'bg-background'
                } ${
                  alert.severity === 'critical' ? 'border-severity-critical' : 
                  alert.severity === 'high' ? 'border-severity-high' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertTypeIcon(alert.alert_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {getSeverityIcon(alert.severity)}
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">
                        {alert.alert_type}
                      </Badge>
                      {alert.is_acknowledged && (
                        <Badge variant="secondary">
                          <Check className="h-3 w-3 mr-1" />
                          Reconhecido
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-sm mb-1">
                      {alert.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </div>
                    
                    {alert.data && Object.keys(alert.data).length > 0 && (
                      <div className="mt-2 text-xs">
                        <details className="cursor-pointer">
                          <summary className="text-muted-foreground hover:text-foreground">
                            Ver detalhes técnicos
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(alert.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {!alert.is_acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismiss(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
