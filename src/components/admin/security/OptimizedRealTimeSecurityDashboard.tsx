
import React, { memo, Suspense } from 'react';
import { useRealTimeSecurityMonitor } from '@/hooks/security/useRealTimeSecurityMonitor';
import { useAnomalyDetection } from '@/hooks/security/useAnomalyDetection';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { useSecurityCache } from '@/hooks/performance/useSecurityCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PerformanceIndicator } from './PerformanceIndicator';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Zap
} from 'lucide-react';

// Componente simplificado para métricas básicas
const SimpleMetricsCard = memo<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}>(({ title, value, icon, trend = 'stable' }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== 'stable' && (
            <TrendingUp className={`h-4 w-4 ${trend === 'up' ? 'text-system-healthy' : 'text-status-error'}`} />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
));

SimpleMetricsCard.displayName = 'SimpleMetricsCard';

// Componente simplificado para alertas
const SimpleAlertsCard = memo<{
  alerts: Array<{ id: string; type: string; message: string; severity: string }>;
}>(({ alerts }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Alertas Recentes
      </CardTitle>
    </CardHeader>
    <CardContent>
      {alerts.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">Nenhum alerta ativo</p>
      ) : (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{alert.message}</span>
              <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                {alert.severity}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
));

SimpleAlertsCard.displayName = 'SimpleAlertsCard';

export const OptimizedRealTimeSecurityDashboard = memo(() => {
  const { metrics, events, isLoading, error } = useRealTimeSecurityMonitor();
  const { anomalies, patterns } = useAnomalyDetection();
  const { metrics: perfMetrics } = usePerformanceMonitor('SecurityDashboard');
  const cache = useSecurityCache({ ttl: 5 * 60 * 1000 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-severity-critical" />
            <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dashboard</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simplificar alertas para reduzir uso de memória
  const simpleAlerts = events.slice(0, 10).map(event => ({
    id: event.id,
    type: event.event_type,
    message: `Evento ${event.event_type} detectado`,
    severity: event.severity
  }));

  return (
    <div className="space-y-6">
      {/* Indicador de Performance */}
      <PerformanceIndicator
        renderTime={perfMetrics.renderTime}
        cacheHitRatio={cache.hitRatio}
        workerAvailable={true}
        componentName="SecurityDashboard"
      />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SimpleMetricsCard
          title="Total de Eventos"
          value={metrics.totalEvents}
          icon={<Activity className="h-5 w-5 text-operational" />}
        />
        <SimpleMetricsCard
          title="Eventos Críticos"
          value={metrics.criticalEvents}
          icon={<AlertTriangle className="h-5 w-5 text-severity-critical" />}
          trend={metrics.criticalEvents > 0 ? 'up' : 'stable'}
        />
        <SimpleMetricsCard
          title="Incidentes Ativos"
          value={metrics.activeIncidents}
          icon={<Shield className="h-5 w-5 text-severity-high" />}
        />
        <SimpleMetricsCard
          title="Anomalias"
          value={metrics.anomaliesDetected}
          icon={<Zap className="h-5 w-5 text-operational" />}
        />
      </div>

      {/* Alertas e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleAlertsCard alerts={simpleAlerts} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Padrões Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patterns.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum padrão anômalo detectado
              </p>
            ) : (
              <div className="space-y-2">
                {patterns.slice(0, 5).map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{pattern.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={pattern.severity === 'critical' ? 'destructive' : 'default'}>
                        {pattern.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status do Sistema de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold text-system-healthy">Online</div>
              <p className="text-sm text-muted-foreground">Monitoramento Ativo</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold text-operational">
                {cache.hitRatio > 0.8 ? 'Otimizado' : 'Normal'}
              </div>
              <p className="text-sm text-muted-foreground">Performance</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold text-operational">
                {new Date().toLocaleTimeString('pt-BR')}
              </div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedRealTimeSecurityDashboard.displayName = 'OptimizedRealTimeSecurityDashboard';
