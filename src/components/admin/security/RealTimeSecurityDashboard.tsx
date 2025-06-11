
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Eye,
  RefreshCw,
  Play
} from 'lucide-react';
import { useRealTimeSecurityMonitor } from '@/hooks/security/useRealTimeSecurityMonitor';
import { useAnomalyDetection } from '@/hooks/security/useAnomalyDetection';
import { SecurityAuditTrail } from './SecurityAuditTrail';
import { SecurityMetricsPanel } from './SecurityMetricsPanel';
import { SecurityIncidentManager } from './SecurityIncidentManager';
import { SecurityAlertSystem } from './SecurityAlertSystem';

export const RealTimeSecurityDashboard = () => {
  const {
    events,
    incidents,
    metrics,
    isLoading,
    error,
    triggerAnomalyDetection,
    refreshData
  } = useRealTimeSecurityMonitor();

  const {
    anomalies,
    patterns,
    isAnalyzing,
    lastAnalysis,
    runAnomalyDetection
  } = useAnomalyDetection();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      await runAnomalyDetection();
    } catch (error) {
      console.error('Erro ao executar análise:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Segurança Avançado</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real • Última atualização: {metrics.lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <Play className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analisando...' : 'Executar Análise'}
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {metrics.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metrics.criticalEvents} evento(s) crítico(s) detectado(s) nas últimas 24 horas.
            Revise imediatamente a aba "Incidentes".
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Ativos</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              em investigação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalias Detectadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.anomaliesDetected}</div>
            <p className="text-xs text-muted-foreground">
              nas últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Padrões de Anomalias */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Padrões de Anomalias Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pattern.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {pattern.count} ocorrências
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(pattern.severity) as any}>
                    {pattern.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs com Conteúdo Detalhado */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <SecurityAuditTrail events={events} />
        </TabsContent>

        <TabsContent value="incidents">
          <SecurityIncidentManager incidents={incidents} />
        </TabsContent>

        <TabsContent value="metrics">
          <SecurityMetricsPanel />
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Anomalias de Segurança
                {lastAnalysis && (
                  <span className="text-sm text-muted-foreground font-normal">
                    • Última análise: {lastAnalysis.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma anomalia detectada nos últimos 7 dias
                </p>
              ) : (
                <div className="space-y-4">
                  {anomalies.slice(0, 10).map((anomaly) => (
                    <div key={anomaly.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(anomaly.confidence_score > 0.8 ? 'high' : 'medium') as any}>
                            {anomaly.anomaly_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Confiança: {(anomaly.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm">{anomaly.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(anomaly.detected_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {anomaly.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlertSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};
