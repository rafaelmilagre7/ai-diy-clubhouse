
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Shield, 
  Zap, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SupabaseStatsCardProps {
  data?: {
    dbStats: {
      totalQueries: number;
      successRate: number;
      errorRate: number;
      avgResponseTime: number;
      slowQueries: any[];
    };
    authStats: {
      totalLogins: number;
      successfulLogins: number;
      failedLogins: number;
      activeUsers24h: number;
    };
    edgeFunctionStats: {
      totalInvocations: number;
      errorRate: number;
      avgDuration: number;
      topErrors: any[];
    };
    realTimeMetrics: {
      activeConnections: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
  loading?: boolean;
  timeRange: string;
}

export const SupabaseStatsCard: React.FC<SupabaseStatsCardProps> = ({ 
  data, 
  loading = false,
  timeRange 
}) => {
  const getTrendIcon = (value: number, threshold: number, inverted = false) => {
    if (inverted) {
      if (value > threshold) return <TrendingDown className="w-4 h-4 text-destructive" />;
      if (value < threshold * 0.5) return <TrendingUp className="w-4 h-4 text-success" />;
    } else {
      if (value > threshold) return <TrendingUp className="w-4 h-4 text-success" />;
      if (value < threshold * 0.5) return <TrendingDown className="w-4 h-4 text-destructive" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBadge = (value: number, good: number, warning: number) => {
    if (value >= good) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (value >= warning) return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
    return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Database Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Database</CardTitle>
            </div>
            {getTrendIcon(data.dbStats.successRate, 95)}
          </div>
          <CardDescription>Performance do PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Taxa de Sucesso</span>
              <span className="text-sm font-bold">
                {data.dbStats.successRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={data.dbStats.successRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Queries</span>
              <span className="text-sm font-medium">{data.dbStats.totalQueries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tempo Médio</span>
              <span className="text-sm font-medium">{data.dbStats.avgResponseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Queries Lentas</span>
              <span className="text-sm font-medium">{data.dbStats.slowQueries.length}</span>
            </div>
          </div>

          {getStatusBadge(data.dbStats.successRate, 95, 90)}
        </CardContent>
      </Card>

      {/* Auth Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Autenticação</CardTitle>
            </div>
            {getTrendIcon(data.authStats.activeUsers24h, 10)}
          </div>
          <CardDescription>Usuários e logins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {data.authStats.activeUsers24h}
            </div>
            <div className="text-sm text-muted-foreground">Usuários Ativos</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Logins</span>
              <span className="text-sm font-medium">{data.authStats.totalLogins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sucessos</span>
              <span className="text-sm font-medium text-green-600">
                {data.authStats.successfulLogins}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Falhas</span>
              <span className="text-sm font-medium text-red-600">
                {data.authStats.failedLogins}
              </span>
            </div>
          </div>

          {data.authStats.totalLogins > 0 && 
            getStatusBadge(
              (data.authStats.successfulLogins / data.authStats.totalLogins) * 100, 
              95, 
              90
            )
          }
        </CardContent>
      </Card>

      {/* Edge Functions Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg">Edge Functions</CardTitle>
            </div>
            {getTrendIcon(data.edgeFunctionStats.errorRate, 5, true)}
          </div>
          <CardDescription>Funções serverless</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {data.edgeFunctionStats.totalInvocations}
            </div>
            <div className="text-sm text-muted-foreground">Invocações</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Taxa de Erro</span>
              <span className="text-sm font-medium">
                {data.edgeFunctionStats.errorRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duração Média</span>
              <span className="text-sm font-medium">
                {data.edgeFunctionStats.avgDuration.toFixed(0)}ms
              </span>
            </div>
          </div>

          {getStatusBadge(100 - data.edgeFunctionStats.errorRate, 95, 90)}
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">Sistema</CardTitle>
            </div>
            {getTrendIcon(data.realTimeMetrics.memoryUsage, 80, true)}
          </div>
          <CardDescription>Métricas em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Uso de Memória</span>
              <span className="text-sm font-bold">
                {data.realTimeMetrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={data.realTimeMetrics.memoryUsage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Uso de CPU</span>
              <span className="text-sm font-bold">
                {data.realTimeMetrics.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={data.realTimeMetrics.cpuUsage} className="h-2" />
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Conexões Ativas</span>
            <span className="text-sm font-medium">{data.realTimeMetrics.activeConnections}</span>
          </div>

          {getStatusBadge(100 - data.realTimeMetrics.memoryUsage, 80, 60)}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseStatsCard;
