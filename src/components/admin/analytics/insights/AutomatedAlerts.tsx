
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AutomatedAlertsProps {
  timeRange?: string;
}

export const AutomatedAlerts: React.FC<AutomatedAlertsProps> = ({ timeRange }) => {
  // Mock data for alerts
  const alerts = [
    {
      id: '1',
      type: 'performance',
      title: 'Queda na Taxa de Conversão',
      description: 'Taxa de conversão de convites caiu 15% nas últimas 24h',
      severity: 'high',
      timestamp: new Date().toISOString(),
      resolved: false
    },
    {
      id: '2',
      type: 'engagement',
      title: 'Baixo Engajamento em Cursos',
      description: 'Tempo médio de sessão diminuiu 20% esta semana',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      resolved: false
    },
    {
      id: '3',
      type: 'system',
      title: 'Uso de Storage Alto',
      description: 'Armazenamento de vídeos em 85% da capacidade',
      severity: 'low',
      timestamp: new Date().toISOString(),
      resolved: true
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertas Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 space-y-3 ${
              alert.resolved ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(alert.severity)}
                <h4 className="font-medium">{alert.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                {alert.resolved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Resolvido
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {alert.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(alert.timestamp).toLocaleString('pt-BR')}
              </span>
              {!alert.resolved && (
                <Button size="sm" variant="outline">
                  Marcar como resolvido
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
