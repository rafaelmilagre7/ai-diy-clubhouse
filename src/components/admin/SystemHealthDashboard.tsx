import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  AlertTriangle, 
  Database, 
  Zap, 
  Shield, 
  Clock,
  TrendingUp,
  Server
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemMetrics {
  connectionMetrics: {
    total_connections: number;
    active_connections: number;
    pool_utilization_percent: number;
    alerts: string[];
  };
  hublaStatus: {
    activeWebhooks: number;
    maxConcurrent: number;
    isCircuitOpen: boolean;
    utilizationPercent: number;
  };
  rateLimiterStatus: {
    logCount: number;
    maxLogsPerMinute: number;
    utilizationPercent: number;
    isEmergencyMode: boolean;
  };
}

export const SystemHealthDashboard = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      // Buscar métricas de conexão
      const connectionResponse = await supabase.functions.invoke('connection-monitor');
      
      // Buscar status do Hubla circuit breaker
      const hublaResponse = await supabase.functions.invoke('hubla-webhook', {
        body: { action: 'status' }
      });
      
      // Buscar status do rate limiter
      const rateLimiterResponse = await supabase.functions.invoke('emergency-rate-limiter', {
        body: { action: 'status' }
      });

      setMetrics({
        connectionMetrics: connectionResponse.data?.metrics || {},
        hublaStatus: hublaResponse.data?.circuitStatus || {},
        rateLimiterStatus: rateLimiterResponse.data?.status || {}
      });
      
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast.error('Erro ao carregar métricas do sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAction = async (action: string) => {
    try {
      switch (action) {
        case 'flush_logs':
          await supabase.functions.invoke('emergency-rate-limiter', {
            body: { action: 'flush' }
          });
          toast.success('Logs processados em batch');
          break;
          
        case 'force_cleanup':
          await supabase.rpc('force_cleanup_connections');
          toast.success('Cleanup de conexões executado');
          break;
          
        default:
          toast.error('Ação desconhecida');
      }
      
      // Atualizar métricas após ação
      setTimeout(fetchMetrics, 1000);
      
    } catch (error) {
      console.error('Erro na ação de emergência:', error);
      toast.error('Erro ao executar ação de emergência');
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000); // 30s
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getSeverityColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'destructive';
    if (value >= thresholds.warning) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const connectionAlerts = metrics?.connectionMetrics?.alerts || [];
  const hasAlerts = connectionAlerts.length > 0 || 
                   metrics?.hublaStatus?.isCircuitOpen || 
                   metrics?.rateLimiterStatus?.isEmergencyMode;

  return (
    <div className="space-y-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Saúde do Sistema</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-sm">
        <Button
          variant={autoRefresh ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          <Clock className="h-4 w-4 mr-sm" />
          Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
        </Button>
        
        <Button size="sm" onClick={fetchMetrics}>
          <Activity className="h-4 w-4 mr-sm" />
          Atualizar
        </Button>
      </div>

      {/* Alertas Críticos */}
      {hasAlerts && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-xs">
              {connectionAlerts.map((alert, index) => (
                <div key={index}>🚨 {alert}</div>
              ))}
              {metrics?.hublaStatus?.isCircuitOpen && (
                <div>🔥 Circuit Breaker Hubla: ATIVO</div>
              )}
              {metrics?.rateLimiterStatus?.isEmergencyMode && (
                <div>⚠️ Rate Limiter: MODO EMERGÊNCIA</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="connections">Conexões DB</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks Hubla</TabsTrigger>
          <TabsTrigger value="logs">Rate Limiter</TabsTrigger>
          <TabsTrigger value="emergency">Emergência</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conexões DB</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.connectionMetrics?.total_connections || 0}
                </div>
                <Progress 
                  value={metrics?.connectionMetrics?.pool_utilization_percent || 0} 
                  className="mt-sm"
                />
                <p className="text-xs text-muted-foreground mt-xs">
                  {metrics?.connectionMetrics?.pool_utilization_percent?.toFixed(1)}% utilização
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhooks Hubla</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.hublaStatus?.activeWebhooks || 0}/{metrics?.hublaStatus?.maxConcurrent || 5}
                </div>
                <Progress 
                  value={metrics?.hublaStatus?.utilizationPercent || 0} 
                  className="mt-2"
                />
                <Badge 
                  variant={metrics?.hublaStatus?.isCircuitOpen ? "destructive" : "default"}
                  className="mt-2"
                >
                  {metrics?.hublaStatus?.isCircuitOpen ? "Circuit Aberto" : "Operacional"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limiter</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.rateLimiterStatus?.logCount || 0}/{metrics?.rateLimiterStatus?.maxLogsPerMinute || 200}
                </div>
                <Progress 
                  value={metrics?.rateLimiterStatus?.utilizationPercent || 0} 
                  className="mt-2"
                />
                <Badge 
                  variant={metrics?.rateLimiterStatus?.isEmergencyMode ? "destructive" : "default"}
                  className="mt-2"
                >
                  {metrics?.rateLimiterStatus?.isEmergencyMode ? "Emergência" : "Normal"}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ações de Emergência */}
        <TabsContent value="emergency" className="space-y-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Controles de Emergência
              </CardTitle>
              <CardDescription>
                Use apenas em situações críticas de sobrecarga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <Button
                  variant="destructive"
                  onClick={() => handleEmergencyAction('flush_logs')}
                  className="w-full"
                >
                  <Server className="h-4 w-4 mr-sm" />
                  Forçar Flush de Logs
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handleEmergencyAction('force_cleanup')}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-sm" />
                  Cleanup Conexões
                </Button>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Essas ações devem ser usadas apenas quando o sistema estiver sob alta carga.
                  Monitorar métricas após execução.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};