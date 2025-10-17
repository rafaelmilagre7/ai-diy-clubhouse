
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock,
  BarChart3
} from 'lucide-react';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeIncidents: number;
  anomaliesDetected: number;
  lastUpdate: Date;
}

interface SecurityAnomaly {
  id: string;
  anomaly_type: string;
  confidence_score: number;
  description?: string;
  status: string;
  detected_at: string;
}

interface AnomalyPattern {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface OptimizedSecurityMetricsPanelProps {
  metrics: SecurityMetrics;
  anomalies: SecurityAnomaly[];
  patterns: AnomalyPattern[];
}

export const OptimizedSecurityMetricsPanel = memo<OptimizedSecurityMetricsPanelProps>(({
  metrics,
  anomalies,
  patterns
}) => {
  // Memoizar padrões críticos
  const criticalPatterns = useMemo(() => 
    patterns.filter(p => p.severity === 'critical'),
    [patterns]
  );

  // Memoizar anomalias recentes (apenas as 3 mais recentes para economizar memória)
  const recentAnomalies = useMemo(() => 
    anomalies.slice(0, 3),
    [anomalies]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Padrões de Anomalias - Simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Padrões de Anomalias
          </CardTitle>
          <CardDescription>
            Análise de padrões detectados (últimos 7 dias)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum padrão detectado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.slice(0, 3).map((pattern, index) => (
                <div key={`${pattern.type}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={pattern.severity === 'critical' ? 'destructive' : 'default'}>
                        {pattern.severity}
                      </Badge>
                      <span className="font-medium text-sm">{pattern.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pattern.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{pattern.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomalias Recentes - Simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anomalias Recentes
          </CardTitle>
          <CardDescription>
            Últimas anomalias detectadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAnomalies.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma anomalia recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {anomaly.anomaly_type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(anomaly.detected_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">
                    {anomaly.description || 'Anomalia detectada'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Confiança: {Math.round(anomaly.confidence_score * 100)}%
                    </span>
                    <Badge 
                      variant={anomaly.status === 'resolved' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {anomaly.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Métricas - Simplificado */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumo de Segurança
          </CardTitle>
          <CardDescription>
            Visão geral das métricas atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border rounded-lg">
              <div className="text-xl font-bold text-operational">
                {metrics.totalEvents}
              </div>
              <p className="text-xs text-muted-foreground">Total de Eventos</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="text-xl font-bold text-severity-critical">
                {metrics.criticalEvents}
              </div>
              <p className="text-xs text-muted-foreground">Eventos Críticos</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="text-xl font-bold text-severity-high">
                {metrics.activeIncidents}
              </div>
              <p className="text-xs text-muted-foreground">Incidentes Ativos</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="text-xl font-bold text-operational">
                {metrics.anomaliesDetected}
              </div>
              <p className="text-xs text-muted-foreground">Anomalias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedSecurityMetricsPanel.displayName = 'OptimizedSecurityMetricsPanel';
