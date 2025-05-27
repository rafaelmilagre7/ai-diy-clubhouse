
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Database, 
  Shield, 
  Zap, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { usePerformance } from '@/contexts/performance/PerformanceProvider';
import { useSupabaseAnalytics } from '@/hooks/analytics/useSupabaseAnalytics';
import { useSupabaseAlerts } from '@/hooks/analytics/useSupabaseAlerts';
import { AlertsPanel } from '@/components/admin/performance/AlertsPanel';
import { PerformanceCharts } from '@/components/admin/performance/PerformanceCharts';
import { WebVitalsCard } from '@/components/admin/performance/WebVitalsCard';

const PerformanceDashboard = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { alerts, clearAlerts, realTimeStats } = usePerformance();
  const { data: analyticsData, loading, error, lastUpdated, refreshData } = useSupabaseAnalytics({ timeRange });
  const { getAlertStats } = useSupabaseAlerts();

  const alertStats = getAlertStats();
  const criticalAlerts = alerts.filter(a => a.severity === 'high').length;
  const warningAlerts = alerts.filter(a => a.severity === 'medium' || a.severity === 'low').length;

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Nunca';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  if (error && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard de Performance</h1>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Erro ao Carregar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não foi possível conectar com o Supabase Analytics. 
              Usando dados de fallback para manter a funcionalidade.
            </p>
            <p className="text-sm text-red-600 mt-2">Erro: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do Supabase e aplicação
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-muted-foreground">
            Última atualização: {formatLastUpdated(lastUpdated)}
          </div>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-7 w-16" /> : analyticsData?.dbStats.totalQueries || 0}
                </div>
                <div className="text-sm text-muted-foreground">Queries (24h)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-7 w-16" /> : analyticsData?.authStats.activeUsers24h || 0}
                </div>
                <div className="text-sm text-muted-foreground">Usuários Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    `${analyticsData?.edgeFunctionStats.totalInvocations || 0}`
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Edge Functions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    analyticsData?.dbStats.successRate ? `${analyticsData.dbStats.successRate.toFixed(1)}%` : '100%'
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Tempo */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>
            Selecione o período para análise das métricas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <TabsList>
              <TabsTrigger value="1h">Última Hora</TabsTrigger>
              <TabsTrigger value="24h">24 Horas</TabsTrigger>
              <TabsTrigger value="7d">7 Dias</TabsTrigger>
              <TabsTrigger value="30d">30 Dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alertas em Destaque */}
      {(criticalAlerts > 0 || warningAlerts > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Alertas Ativos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {criticalAlerts > 0 && (
                <Badge variant="destructive">
                  {criticalAlerts} Crítico{criticalAlerts > 1 ? 's' : ''}
                </Badge>
              )}
              {warningAlerts > 0 && (
                <Badge variant="secondary">
                  {warningAlerts} Aviso{warningAlerts > 1 ? 's' : ''}
                </Badge>
              )}
              <Button onClick={clearAlerts} variant="outline" size="sm">
                Limpar Alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Principais */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PerformanceCharts queryStats={analyticsData?.dbStats} />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Banco</CardTitle>
                <CardDescription>Métricas de performance do PostgreSQL</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Queries:</span>
                      <span className="font-bold">{analyticsData?.dbStats.totalQueries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-bold text-green-600">
                        {analyticsData?.dbStats.successRate?.toFixed(1) || 100}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Médio:</span>
                      <span className="font-bold">
                        {analyticsData?.dbStats.avgResponseTime?.toFixed(0) || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queries Lentas:</span>
                      <span className="font-bold">
                        {analyticsData?.dbStats.slowQueries?.length || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas em Tempo Real</CardTitle>
                <CardDescription>Status atual do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Conexões Ativas:</span>
                      <span className="font-bold">{analyticsData?.realTimeMetrics.activeConnections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uso de Memória:</span>
                      <span className="font-bold">
                        {analyticsData?.realTimeMetrics.memoryUsage?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uso de CPU:</span>
                      <span className="font-bold">
                        {analyticsData?.realTimeMetrics.cpuUsage?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Autenticação</CardTitle>
              <CardDescription>Métricas de login e usuários ativos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData?.authStats.totalLogins || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Logins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData?.authStats.successfulLogins || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analyticsData?.authStats.failedLogins || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Falhas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData?.authStats.activeUsers24h || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Ativos 24h</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edge Functions</CardTitle>
              <CardDescription>Performance das funções serverless</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Invocações:</span>
                    <span className="font-bold">{analyticsData?.edgeFunctionStats.totalInvocations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Erro:</span>
                    <span className="font-bold">
                      {analyticsData?.edgeFunctionStats.errorRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração Média:</span>
                    <span className="font-bold">
                      {analyticsData?.edgeFunctionStats.avgDuration?.toFixed(0) || 0}ms
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel
            alerts={alerts}
            onClearAlerts={clearAlerts}
            criticalCount={criticalAlerts}
            warningCount={warningAlerts}
          />
        </TabsContent>

        <TabsContent value="web-vitals" className="space-y-6">
          <WebVitalsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
