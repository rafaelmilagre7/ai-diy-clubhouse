
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSyncMonitor } from '@/hooks/monitoring/useSyncMonitor';
import { useSupabaseHealthCheck } from '@/hooks/monitoring/useSupabaseHealthCheck';
import { useCacheMonitor } from '@/hooks/monitoring/useCacheMonitor';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Activity,
  Database,
  Wifi,
  Shield,
  HardDrive
} from 'lucide-react';

export const SyncHealthDashboard: React.FC = () => {
  const { health, metrics } = useSyncMonitor();
  const { healthStatus, metrics: supabaseMetrics, utils } = useSupabaseHealthCheck();
  const { getCacheStats } = useCacheMonitor();
  
  const cacheStats = getCacheStats();
  
  const getHealthIcon = (status: string, size = 'h-4 w-4') => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'authenticated':
        return <CheckCircle className={`${size} text-green-500`} />;
      case 'slow':
      case 'degraded':
      case 'connecting':
        return <AlertCircle className={`${size} text-yellow-500`} />;
      case 'error':
      case 'critical':
      case 'disconnected':
        return <XCircle className={`${size} text-red-500`} />;
      default:
        return <Clock className={`${size} text-gray-500`} />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'authenticated':
        return 'bg-green-500';
      case 'slow':
      case 'degraded':
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
      case 'critical':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const recentIssues = metrics.slice(-5).reverse();

  return (
    <div className="space-y-6 p-4">
      {/* Header com status geral */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Monitor de Sincronização</h2>
        <div className="flex items-center gap-2">
          {getHealthIcon(healthStatus.overall, 'h-6 w-6')}
          <Badge 
            variant={healthStatus.overall === 'healthy' ? 'default' : 'destructive'}
            className="text-lg px-3 py-1"
          >
            {healthStatus.overall === 'healthy' ? 'Saudável' : 
             healthStatus.overall === 'degraded' ? 'Degradado' : 'Crítico'}
          </Badge>
        </div>
      </div>

      {/* Alertas críticos */}
      {healthStatus.overall === 'critical' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Sistema em Estado Crítico</AlertTitle>
          <AlertDescription>
            Problemas críticos detectados. A experiência do usuário pode estar comprometida.
          </AlertDescription>
        </Alert>
      )}

      {health.score < 70 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sincronização Degradada (Score: {health.score}/100)</AlertTitle>
          <AlertDescription>
            {health.criticalIssues > 0 && `${health.criticalIssues} problemas críticos detectados. `}
            Componentes com problemas: {health.trends.worseningComponents.join(', ') || 'Nenhum específico'}
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de status dos serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Database</CardTitle>
            <Database className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthIcon(healthStatus.database)}
              <span className="text-2xl font-bold text-white capitalize">
                {healthStatus.database}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Latência: {supabaseMetrics.databaseLatency}ms
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Realtime</CardTitle>
            <Wifi className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthIcon(healthStatus.realtime)}
              <span className="text-2xl font-bold text-white capitalize">
                {healthStatus.realtime}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Auth</CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthIcon(healthStatus.auth)}
              <span className="text-2xl font-bold text-white capitalize">
                {healthStatus.auth}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthIcon(healthStatus.storage)}
              <span className="text-2xl font-bold text-white capitalize">
                {healthStatus.storage}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de sincronização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Score de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Score Geral</span>
                <span className="text-white font-bold">{health.score}/100</span>
              </div>
              <Progress 
                value={health.score} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total de Problemas</p>
                <p className="text-white font-bold">{health.totalIssues}</p>
              </div>
              <div>
                <p className="text-gray-400">Críticos</p>
                <p className="text-red-400 font-bold">{health.criticalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Cache Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Hit Rate</span>
                <span className="text-white font-bold">{cacheStats.hitRate}%</span>
              </div>
              <Progress 
                value={Number(cacheStats.hitRate)} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total Queries</p>
                <p className="text-white font-bold">{cacheStats.totalQueries}</p>
              </div>
              <div>
                <p className="text-gray-400">Stale</p>
                <p className="text-yellow-400 font-bold">{cacheStats.staleQueries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Problemas recentes */}
      {recentIssues.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Problemas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  {getHealthIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {issue.component}
                      </Badge>
                      <Badge 
                        variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-white mt-1">{issue.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(issue.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
