
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Activity, Clock, Users, Database, TrendingUp, Zap } from 'lucide-react';
import { useRealTimeSecurityMonitor } from '@/hooks/security/useRealTimeSecurityMonitor';
import { useAnomalyDetection } from '@/hooks/security/useAnomalyDetection';
import { SecurityAuditTrail } from './SecurityAuditTrail';
import { SecurityMetricsPanel } from './SecurityMetricsPanel';
import { SecurityIncidentManager } from './SecurityIncidentManager';
import { SecurityAlertSystem } from './SecurityAlertSystem';

export const RealTimeSecurityDashboard = () => {
  const { events, incidents, metrics, isLoading, error, triggerAnomalyDetection, refreshData } = useRealTimeSecurityMonitor();
  const { anomalies, patterns, isAnalyzing, runAnomalyDetection } = useAnomalyDetection();
  const [activeTab, setActiveTab] = useState('overview');

  // Simular alertas para o SecurityAlertSystem
  const mockAlerts = anomalies.map(anomaly => ({
    id: anomaly.id,
    title: `Anomalia de Segurança: ${anomaly.anomaly_type}`,
    message: anomaly.description || 'Anomalia detectada no sistema',
    severity: anomaly.confidence_score > 0.8 ? 'critical' : 'high',
    alert_type: anomaly.anomaly_type,
    created_at: anomaly.detected_at,
    is_acknowledged: anomaly.status !== 'detected',
    data: anomaly.detection_data
  }));

  const handleAcknowledgeAlert = async (alertId: string) => {
    // Implementar lógica de reconhecimento
    console.log('Acknowledging alert:', alertId);
  };

  const handleDismissAlert = async (alertId: string) => {
    // Implementar lógica de dismissal
    console.log('Dismissing alert:', alertId);
  };

  const handleRunAnalysis = async () => {
    try {
      await runAnomalyDetection();
      await refreshData();
    } catch (error) {
      console.error('Erro ao executar análise:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 animate-spin" />
          <span>Carregando dashboard de segurança...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshData}>Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos (24h)</p>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Críticos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incidentes Ativos</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.activeIncidents}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Anomalias</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.anomaliesDetected}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analisando...' : 'Executar Análise de Anomalias'}
            </Button>
            
            <Button variant="outline" onClick={refreshData}>
              <Clock className="h-4 w-4 mr-2" />
              Atualizar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Padrões de anomalias detectados */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Padrões de Anomalias Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pattern.description}</p>
                    <p className="text-sm text-muted-foreground">{pattern.count} ocorrências</p>
                  </div>
                  <Badge variant={
                    pattern.severity === 'critical' ? 'destructive' :
                    pattern.severity === 'high' ? 'destructive' :
                    pattern.severity === 'medium' ? 'default' : 'secondary'
                  }>
                    {pattern.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs com diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos eventos */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Eventos de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant={
                        event.severity === 'critical' ? 'destructive' :
                        event.severity === 'high' ? 'destructive' :
                        'default'
                      }>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Incidentes recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Incidentes Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.slice(0, 5).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(incident.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          incident.severity === 'critical' ? 'destructive' :
                          incident.severity === 'high' ? 'destructive' :
                          'default'
                        }>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlertSystem 
            alerts={mockAlerts}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
          />
        </TabsContent>

        <TabsContent value="incidents">
          <SecurityIncidentManager />
        </TabsContent>

        <TabsContent value="metrics">
          <SecurityMetricsPanel />
        </TabsContent>

        <TabsContent value="audit">
          <SecurityAuditTrail />
        </TabsContent>
      </Tabs>

      {/* Informações de última atualização */}
      <div className="text-center text-sm text-muted-foreground">
        Última atualização: {metrics.lastUpdate.toLocaleString('pt-BR')}
      </div>
    </div>
  );
};
