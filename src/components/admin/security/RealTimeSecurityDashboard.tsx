
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useRealTimeSecurityMonitor } from '@/hooks/security/useRealTimeSecurityMonitor';
import { useAnomalyDetection } from '@/hooks/security/useAnomalyDetection';
import { SecurityMetricsPanel } from './SecurityMetricsPanel';
import { SecurityIncidentManager } from './SecurityIncidentManager';
import { SecurityAuditTrail } from './SecurityAuditTrail';
import { SecurityAlertSystem } from './SecurityAlertSystem';

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_type: string;
  created_at: string;
  is_acknowledged: boolean;
  data?: Record<string, any>;
}

export const RealTimeSecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Hooks de monitoramento
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
    runAnomalyDetection,
    updateAnomalyStatus,
    lastAnalysis
  } = useAnomalyDetection();

  // Função para executar análise completa
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await Promise.all([
        runAnomalyDetection(),
        triggerAnomalyDetection()
      ]);
      await refreshData();
    } catch (error) {
      console.error('Erro ao executar análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função para obter alertas reais do sistema
  const getSystemAlerts = (): AlertNotification[] => {
    // Retornar apenas alertas reais dos hooks de monitoramento
    return incidents?.map(incident => ({
      id: incident.id,
      title: incident.title || 'Incidente de Segurança',
      message: incident.description || 'Descrição não disponível',
      severity: (incident.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
      alert_type: 'security_incident',
      created_at: incident.created_at,
      is_acknowledged: incident.status === 'resolved',
      data: incident.metadata
    })) || [];
  };

  const systemAlerts = getSystemAlerts();

  // Funções de manipulação de alertas
  const handleAcknowledgeAlert = (alertId: string) => {
    console.log('Reconhecendo alerta:', alertId);
    // Implementar lógica de reconhecimento
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Descartando alerta:', alertId);
    // Implementar lógica de descarte
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Carregando dashboard de segurança...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro ao carregar dados de segurança: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-system-healthy" />
              <div>
                <p className="text-sm font-medium">Status do Sistema</p>
                <p className="text-2xl font-bold text-system-healthy">Seguro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-severity-low" />
              <div>
                <p className="text-sm font-medium">Eventos (24h)</p>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-severity-high" />
              <div>
                <p className="text-sm font-medium">Incidentes Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-severity-medium" />
              <div>
                <p className="text-sm font-medium">Anomalias</p>
                <p className="text-2xl font-bold">{metrics.anomaliesDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Ação */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Última atualização: {metrics.lastUpdate.toLocaleTimeString('pt-BR')}</span>
          </Badge>
          {lastAnalysis && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Última análise: {lastAnalysis.toLocaleTimeString('pt-BR')}</span>
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            onClick={handleRunAnalysis} 
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Executar Análise
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dashboard Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SecurityMetricsPanel 
            metrics={metrics}
            anomalies={anomalies || []}
            patterns={patterns || []}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <SecurityAlertSystem
            alerts={systemAlerts}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
          />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <SecurityIncidentManager 
            incidents={incidents || []}
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <SecurityAuditTrail 
            events={events || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
