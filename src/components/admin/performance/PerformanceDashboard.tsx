
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  TrendingUp,
  RefreshCw,
  Zap
} from 'lucide-react';
import { usePerformance } from '@/contexts/performance/PerformanceProvider';
import { WebVitalsCard } from './WebVitalsCard';
import { PerformanceCharts } from './PerformanceCharts';
import { AlertsPanel } from './AlertsPanel';

const PerformanceDashboard: React.FC = () => {
  const { 
    getQueryStats, 
    realTimeStats, 
    alerts, 
    clearAlerts, 
    isMonitoring, 
    setIsMonitoring 
  } = usePerformance();
  
  const [queryStats, setQueryStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Atualizar estatísticas
  const refreshStats = async () => {
    setLoading(true);
    try {
      const stats = getQueryStats();
      setQueryStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'high');
  const warningAlerts = alerts.filter(alert => alert.severity === 'medium');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da performance da aplicação
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? 'text-green-600' : 'text-gray-600'}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isMonitoring ? 'Monitorando' : 'Pausado'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Queries Ativas</p>
                <p className="text-2xl font-bold">{realTimeStats.activeQueries}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">{realTimeStats.avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Erro</p>
                <p className="text-2xl font-bold">{realTimeStats.errorRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${realTimeStats.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">{realTimeStats.cacheHitRate.toFixed(1)}%</p>
              </div>
              <Zap className={`h-8 w-8 ${realTimeStats.cacheHitRate > 70 ? 'text-green-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas Críticos ({criticalAlerts.length})</AlertTitle>
          <AlertDescription>
            {criticalAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="mb-1">
                • {alert.message}
              </div>
            ))}
            {criticalAlerts.length > 3 && (
              <div className="text-sm mt-2">
                +{criticalAlerts.length - 3} alertas adicionais
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="webvitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PerformanceCharts queryStats={queryStats} />
        </TabsContent>

        <TabsContent value="webvitals" className="space-y-4">
          <WebVitalsCard />
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          {queryStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Gerais</CardTitle>
                  <CardDescription>Últimas 24 horas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Queries:</span>
                      <span className="font-medium">{queryStats.totalQueries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-medium text-green-600">
                        {queryStats.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Médio:</span>
                      <span className="font-medium">{queryStats.avgDuration.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queries Lentas:</span>
                      <span className="font-medium text-orange-600">
                        {queryStats.slowQueriesCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Queries Mais Lentas */}
              <Card>
                <CardHeader>
                  <CardTitle>Queries Mais Lentas</CardTitle>
                  <CardDescription>Top 5 piores performances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {queryStats.slowestQueries.slice(0, 5).map((query: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-mono truncate max-w-xs">
                          {query.queryKey}
                        </span>
                        <Badge variant={query.duration > 5000 ? 'destructive' : 'secondary'}>
                          {query.duration.toFixed(0)}ms
                        </Badge>
                      </div>
                    ))}
                    {queryStats.slowestQueries.length === 0 && (
                      <p className="text-muted-foreground text-center">
                        Nenhuma query lenta detectada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsPanel 
            alerts={alerts} 
            onClearAlerts={clearAlerts}
            criticalCount={criticalAlerts.length}
            warningCount={warningAlerts.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
