
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
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
  affected_user_id?: string;
  detection_data: Record<string, any>;
  status: string;
  detected_at: string;
}

interface AnomalyPattern {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface SecurityMetricsPanelProps {
  metrics: SecurityMetrics;
  anomalies: SecurityAnomaly[];
  patterns: AnomalyPattern[];
}

export const SecurityMetricsPanel: React.FC<SecurityMetricsPanelProps> = ({
  metrics,
  anomalies,
  patterns
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const criticalPatterns = patterns.filter(p => p.severity === 'critical');
  const recentAnomalies = anomalies.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Padrões de Anomalias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Padrões de Anomalias
          </CardTitle>
          <CardDescription>
            Análise de padrões detectados nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum padrão de anomalia detectado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(pattern.severity) as any}>
                        {pattern.severity}
                      </Badge>
                      <span className="font-medium">{pattern.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{pattern.count}</span>
                    <p className="text-xs text-muted-foreground">ocorrências</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomalias Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anomalias Recentes
          </CardTitle>
          <CardDescription>
            Últimas anomalias detectadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAnomalies.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma anomalia recente detectada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">
                      {anomaly.anomaly_type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(anomaly.detected_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">
                    {anomaly.description || 'Anomalia detectada pelo sistema'}
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

      {/* Alertas Críticos */}
      {criticalPatterns.length > 0 && (
        <Card className="lg:col-span-2 border-status-error/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-status-error">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos
            </CardTitle>
            <CardDescription>
              Padrões que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalPatterns.map((pattern, index) => (
                <div key={index} className="bg-status-error-lighter border border-status-error/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">
                      {pattern.severity}
                    </Badge>
                    <span className="text-2xl font-bold text-status-error">
                      {pattern.count}
                    </span>
                  </div>
                  <h4 className="font-semibold text-status-error mb-1">
                    {pattern.type}
                  </h4>
                  <p className="text-sm text-status-error">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Métricas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumo de Segurança
          </CardTitle>
          <CardDescription>
            Visão geral das métricas de segurança atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.totalEvents}
              </div>
              <p className="text-sm text-muted-foreground">Total de Eventos</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {metrics.criticalEvents}
              </div>
              <p className="text-sm text-muted-foreground">Eventos Críticos</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.activeIncidents}
              </div>
              <p className="text-sm text-muted-foreground">Incidentes Ativos</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.anomaliesDetected}
              </div>
              <p className="text-sm text-muted-foreground">Anomalias Detectadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
