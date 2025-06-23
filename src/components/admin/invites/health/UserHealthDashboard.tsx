
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  RefreshCcw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useHealthCheckData } from '@/hooks/admin/useHealthCheckData';
import { useAtRiskUsers } from '@/hooks/admin/invites/useAtRiskUsers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UserHealthDashboard = () => {
  const { 
    healthMetrics, 
    stats, // CORREÇÃO: usar 'stats' em vez de 'healthStats'
    loading, 
    error, 
    refetch, 
    recalculateHealthScores 
  } = useHealthCheckData();
  
  const { atRiskUsers, healthAlerts, loading: alertsLoading } = useAtRiskUsers();

  const handleRecalculate = async () => {
    try {
      await recalculateHealthScores();
    } catch (error) {
      console.error('Erro ao recalcular scores:', error);
    }
  };

  if (loading || alertsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          <span>Carregando dados de saúde...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Health Check dos Usuários</h1>
          <p className="text-muted-foreground">
            Monitoramento da saúde e engajamento dos membros
          </p>
        </div>
        <Button onClick={handleRecalculate} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Recalcular Scores
        </Button>
      </div>

      {/* Cards de estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Última atualização: {format(new Date(stats.lastUpdated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Saudáveis</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.healthyUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? Math.round((stats.healthyUsers / stats.totalUsers) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.atRiskUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? Math.round((stats.atRiskUsers / stats.totalUsers) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? Math.round((stats.criticalUsers / stats.totalUsers) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas médias */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Score Médio de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageHealthScore}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stats.averageHealthScore >= 70 ? 'bg-green-500' :
                      stats.averageHealthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.averageHealthScore, 100)}%` }}
                  />
                </div>
                <Badge 
                  variant={
                    stats.averageHealthScore >= 70 ? 'default' :
                    stats.averageHealthScore >= 40 ? 'secondary' : 'destructive'
                  }
                >
                  {stats.averageHealthScore >= 70 ? 'Saudável' :
                   stats.averageHealthScore >= 40 ? 'Moderado' : 'Crítico'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Score Médio de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageEngagementScore}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stats.averageEngagementScore >= 70 ? 'bg-blue-500' :
                      stats.averageEngagementScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.averageEngagementScore, 100)}%` }}
                  />
                </div>
                <Badge 
                  variant={
                    stats.averageEngagementScore >= 70 ? 'default' :
                    stats.averageEngagementScore >= 40 ? 'secondary' : 'destructive'
                  }
                >
                  {stats.averageEngagementScore >= 70 ? 'Alto' :
                   stats.averageEngagementScore >= 40 ? 'Moderado' : 'Baixo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de usuários em risco */}
      {healthAlerts && healthAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Usuários que Precisam de Atenção
            </CardTitle>
            <CardDescription>
              Usuários com baixo engajamento ou health score crítico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' : 'outline'
                      }
                    >
                      {alert.severity === 'critical' ? 'Crítico' :
                       alert.severity === 'medium' ? 'Moderado' : 'Baixo'}
                    </Badge>
                    <div>
                      <p className="font-medium">{alert.user_name || 'Usuário sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Score: {alert.health_score || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.severity === 'critical' ? 'Ação urgente' : 'Monitorar'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de métricas dos usuários */}
      {healthMetrics && healthMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Detalhadas dos Usuários</CardTitle>
            <CardDescription>
              Visão detalhada do health score de cada usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthMetrics.slice(0, 10).map((metric) => (
                <div key={metric.user_id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <p className="font-medium">
                      {metric.user_profile?.name || 'Usuário sem nome'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metric.user_profile?.email || 'Email não disponível'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">Saúde: {metric.health_score}</p>
                      <p className="text-xs text-muted-foreground">
                        Engajamento: {metric.engagement_score}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        metric.health_score >= 70 ? 'default' :
                        metric.health_score >= 40 ? 'secondary' : 'destructive'
                      }
                    >
                      {metric.health_score >= 70 ? 'Saudável' :
                       metric.health_score >= 40 ? 'Moderado' : 'Crítico'}
                    </Badge>
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
