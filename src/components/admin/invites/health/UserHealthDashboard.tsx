
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Heart, 
  AlertTriangle, 
  Activity,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useUserHealthDashboard } from '@/hooks/admin/invites/useUserHealthDashboard';
import { toast } from 'sonner';

export const UserHealthDashboard = () => {
  const {
    healthMetrics,
    healthAlerts,
    healthStats,
    loading,
    error,
    initializeHealthData,
    recalculateHealthScores
  } = useUserHealthDashboard();

  const handleInitialize = async () => {
    try {
      await initializeHealthData();
      toast.success('Dados de saúde inicializados com sucesso');
    } catch (error) {
      toast.error('Erro ao inicializar dados de saúde');
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculateHealthScores();
      toast.success('Scores de saúde recalculados com sucesso');
    } catch (error) {
      toast.error('Erro ao recalcular scores de saúde');
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Health Check dos Usuários</h2>
          <div className="flex gap-2">
            <Button disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Health Check dos Usuários</h2>
          <Button onClick={handleInitialize} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Inicializar Dados
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleInitialize}>
                <Zap className="h-4 w-4 mr-2" />
                Inicializar Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Check dos Usuários</h2>
        <div className="flex gap-2">
          <Button onClick={handleRecalculate} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalcular Scores
          </Button>
          <Button onClick={handleInitialize} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Inicializar Dados
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total de Usuários</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {healthStats?.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Usuários Saudáveis</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              {healthStats?.healthyUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Em Risco</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-orange-600">
              {healthStats?.atRiskUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Críticos</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">
              {healthStats?.criticalUsers || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Médio e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Médio de Saúde</CardTitle>
            <CardDescription>Pontuação geral de saúde dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {healthStats?.averageHealthScore || 0}
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(healthStats?.averageHealthScore || 0)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas Ativos</CardTitle>
            <CardDescription>Alertas de saúde que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {healthStats?.activeAlerts || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {healthStats?.totalAlerts || 0} alertas totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários com Problemas de Saúde */}
      {healthMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários que Precisam de Atenção</CardTitle>
            <CardDescription>
              Usuários com scores baixos de saúde ou em risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthMetrics
                .filter(metric => metric.health_score < 70)
                .slice(0, 10)
                .map((metric) => (
                  <div
                    key={metric.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getRiskIcon(metric.risk_level)}
                      <div>
                        <p className="font-medium">
                          {metric.user_profile?.name || 'Usuário sem nome'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {metric.user_profile?.email || 'Email não disponível'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">Score: {metric.health_score}</p>
                        <p className="text-sm text-muted-foreground">
                          Engajamento: {metric.engagement_score}
                        </p>
                      </div>
                      <Badge variant={getRiskBadgeVariant(metric.risk_level)}>
                        {metric.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas Ativos */}
      {healthAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>
              Alertas de saúde gerados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.user_profile?.name} ({alert.user_profile?.email})
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {healthMetrics.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado de saúde encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Clique em "Inicializar Dados" para começar o monitoramento de saúde dos usuários.
              </p>
              <Button onClick={handleInitialize}>
                <Zap className="h-4 w-4 mr-2" />
                Inicializar Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
