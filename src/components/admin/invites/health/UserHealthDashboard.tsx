
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, TrendingUp, Activity, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
import { useHealthCheckData } from '@/hooks/admin/useHealthCheckData';
import { useAtRiskUsers } from '@/hooks/admin/useAtRiskUsers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UserHealthDashboard = () => {
  const { healthMetrics, stats, loading, error, refetch, recalculateHealthScores } = useHealthCheckData();
  const { atRiskUsers, loading: alertsLoading } = useAtRiskUsers();

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
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Health Check dos Usuários</h1>
          <p className="text-muted-foreground">Monitoramento da saúde e engajamento dos membros</p>
        </div>
        
        <Button onClick={handleRecalculate} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Recalcular Scores
        </Button>
      </div>

      {/* Stats Overview */}
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
                Atualizado em {format(new Date(stats.lastUpdated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
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
                {((stats.healthyUsers / stats.totalUsers) * 100).toFixed(1)}% do total
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
                Score entre 30-70
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
                Score abaixo de 30
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Score Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Score Médio de Saúde
            </CardTitle>
            <CardDescription>
              Indicadores gerais de engajamento e progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score Médio de Saúde</span>
                <Badge variant={stats.averageHealthScore >= 70 ? 'default' : stats.averageHealthScore >= 50 ? 'secondary' : 'destructive'}>
                  {stats.averageHealthScore}/100
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score Médio de Engajamento</span>
                <Badge variant={stats.averageEngagementScore >= 70 ? 'default' : stats.averageEngagementScore >= 50 ? 'secondary' : 'destructive'}>
                  {stats.averageEngagementScore}/100
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users at Risk */}
      {atRiskUsers && atRiskUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Usuários que Precisam de Atenção
            </CardTitle>
            <CardDescription>
              Membros com baixo engajamento que podem precisar de intervenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskUsers.slice(0, 10).map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={user.risk_level === 'critical' ? 'destructive' : 
                               user.risk_level === 'high' ? 'secondary' : 'outline'}
                      >
                        {user.risk_level === 'critical' ? 'Crítico' : 
                         user.risk_level === 'high' ? 'Alto Risco' : 'Médio Risco'}
                      </Badge>
                    </div>
                    <p className="font-medium mt-1">{user.user_profile?.name || 'Usuário sem nome'}</p>
                    <p className="text-sm text-muted-foreground">{user.user_profile?.email || 'Email não disponível'}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{user.health_score || 0}</div>
                    <div className="text-xs text-muted-foreground">Health Score</div>
                  </div>
                </div>
              ))}
              
              {atRiskUsers.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  E mais {atRiskUsers.length - 10} usuários...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
