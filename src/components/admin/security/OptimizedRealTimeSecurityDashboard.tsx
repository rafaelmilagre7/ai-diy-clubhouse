
import React, { useState, useEffect, memo, useCallback, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useRealTimeSecurityMonitor } from '@/hooks/security/useRealTimeSecurityMonitor';
import { useAnomalyDetection } from '@/hooks/security/useAnomalyDetection';
import { OptimizedSecurityMetricsPanel } from './OptimizedSecurityMetricsPanel';
import { useSecurityWorker } from '@/hooks/performance/useSecurityWorker';
import { useSecurityCache } from '@/hooks/performance/useSecurityCache';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { useLazyComponent } from '@/hooks/performance/useLazyComponent';

// Lazy loading dos componentes menos críticos
const SecurityIncidentManager = React.lazy(() => 
  import('./SecurityIncidentManager').then(module => ({ default: module.SecurityIncidentManager }))
);

const SecurityAuditTrail = React.lazy(() => 
  import('./SecurityAuditTrail').then(module => ({ default: module.SecurityAuditTrail }))
);

const SecurityAlertSystem = React.lazy(() => 
  import('./SecurityAlertSystem').then(module => ({ default: module.SecurityAlertSystem }))
);

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

// Componente memoizado para estatísticas rápidas
const QuickStatsCard = memo<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}>(({ icon, title, value, color }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center space-x-2">
        {icon}
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
));

QuickStatsCard.displayName = 'QuickStatsCard';

export const OptimizedRealTimeSecurityDashboard = memo(() => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Performance monitoring
  const { metrics: perfMetrics, markStart, markEnd, logPerformance } = usePerformanceMonitor('SecurityDashboard');

  // Cache para dados de segurança
  const cache = useSecurityCache<any>({ ttl: 5 * 60 * 1000 }); // 5 minutos

  // Web worker para análises
  const { analyzeAnomalies, isWorkerAvailable } = useSecurityWorker();

  // Hooks de monitoramento com cache
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

  // Função otimizada para executar análise
  const handleRunAnalysis = useCallback(async () => {
    markStart('analysis');
    setIsAnalyzing(true);
    
    try {
      // Usar cache para evitar análises desnecessárias
      const cacheKey = `analysis_${Date.now() - (Date.now() % (5 * 60 * 1000))}`;
      
      await cache.getOrSet(cacheKey, async () => {
        if (isWorkerAvailable && events.length > 0) {
          // Usar web worker para análise pesada
          await new Promise<void>((resolve) => {
            analyzeAnomalies(events, (result) => {
              console.log('Análise via Web Worker concluída:', result);
              resolve();
            });
          });
        }
        
        await Promise.all([
          runAnomalyDetection(),
          triggerAnomalyDetection()
        ]);
        
        return true;
      });
      
      await refreshData();
    } catch (error) {
      console.error('Erro ao executar análise:', error);
    } finally {
      setIsAnalyzing(false);
      markEnd('analysis');
    }
  }, [
    events, 
    isWorkerAvailable, 
    analyzeAnomalies, 
    runAnomalyDetection, 
    triggerAnomalyDetection, 
    refreshData,
    cache,
    markStart,
    markEnd
  ]);

  // Memoizar alertas mockados
  const mockAlerts = React.useMemo((): AlertNotification[] => [
    {
      id: '1',
      title: 'Tentativas de Login Suspeitas',
      message: 'Detectadas 5 tentativas de login falhadas consecutivas do IP 192.168.1.100',
      severity: 'high' as const,
      alert_type: 'authentication_anomaly',
      created_at: new Date().toISOString(),
      is_acknowledged: false,
      data: { ip: '192.168.1.100', attempts: 5 }
    },
    {
      id: '2',
      title: 'Acesso Fora do Horário',
      message: 'Usuário acessou o sistema às 03:45 AM, fora do horário normal de trabalho',
      severity: 'medium' as const,
      alert_type: 'time_anomaly',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      is_acknowledged: false,
      data: { timestamp: '03:45:00', user_id: 'user123' }
    }
  ], []);

  // Handlers memoizados
  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    console.log('Reconhecendo alerta:', alertId);
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    console.log('Descartando alerta:', alertId);
  }, []);

  // Log de performance periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (perfMetrics.renderTime > 100) {
        logPerformance('warn');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [perfMetrics, logPerformance]);

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
        <QuickStatsCard
          icon={<Shield className="h-5 w-5 text-green-500" />}
          title="Status do Sistema"
          value="Seguro"
          color="text-green-600"
        />
        
        <QuickStatsCard
          icon={<Activity className="h-5 w-5 text-blue-500" />}
          title="Eventos (24h)"
          value={metrics.totalEvents}
          color="text-blue-600"
        />
        
        <QuickStatsCard
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          title="Incidentes Ativos"
          value={metrics.activeIncidents}
          color="text-orange-600"
        />
        
        <QuickStatsCard
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          title="Anomalias"
          value={metrics.anomaliesDetected}
          color="text-purple-600"
        />
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
          {cache.hitRatio > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Cache: {Math.round(cache.hitRatio * 100)}%</span>
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
                {isWorkerAvailable && <span className="ml-1 text-xs">⚡</span>}
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
          <OptimizedSecurityMetricsPanel 
            metrics={metrics}
            anomalies={anomalies}
            patterns={patterns}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Carregando alertas...</div>}>
            <SecurityAlertSystem
              alerts={mockAlerts}
              onAcknowledge={handleAcknowledgeAlert}
              onDismiss={handleDismissAlert}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Carregando incidentes...</div>}>
            <SecurityIncidentManager 
              incidents={incidents || []}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Carregando auditoria...</div>}>
            <SecurityAuditTrail 
              events={events || []}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
});

OptimizedRealTimeSecurityDashboard.displayName = 'OptimizedRealTimeSecurityDashboard';
