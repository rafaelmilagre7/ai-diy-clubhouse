
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
  details?: any;
}

export const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        // Carregar alertas reais dos logs de auditoria
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select('*')
          .in('severity', ['high', 'critical'])
          .order('timestamp', { ascending: false })
          .limit(10);

        if (auditLogs) {
          const mappedAlerts: SecurityAlert[] = auditLogs.map(log => ({
            id: log.id,
            type: log.event_type || 'security_event',
            severity: (log.severity as any) || 'medium',
            message: log.action || 'Evento de segurança detectado',
            timestamp: log.timestamp,
            status: 'active',
            details: log.details
          }));
          
          setAlerts(mappedAlerts);
        }

        // Adicionar alguns alertas de exemplo se não houver dados suficientes
        if (!auditLogs || auditLogs.length < 3) {
          const exampleAlerts: SecurityAlert[] = [
            {
              id: 'alert-1',
              type: 'failed_login',
              severity: 'medium',
              message: 'Múltiplas tentativas de login falhadas detectadas',
              timestamp: new Date(Date.now() - 30000).toISOString(),
              status: 'active'
            },
            {
              id: 'alert-2',
              type: 'security_check',
              severity: 'low',
              message: 'Verificação de segurança automática executada',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              status: 'resolved'
            }
          ];
          
          setAlerts(prev => [...prev, ...exampleAlerts]);
        }

      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge variant="destructive">Alto</Badge>;
      case 'medium':
        return <Badge variant="default">Médio</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixo</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'investigating':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta de segurança ativo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(alert.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{alert.message}</p>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                {alert.status === 'active' && (
                  <Button variant="outline" size="sm">
                    Investigar
                  </Button>
                )}
              </div>
            ))}
            
            {alerts.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline">
                  Ver todos os alertas ({alerts.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
