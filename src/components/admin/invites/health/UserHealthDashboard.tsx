
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Heart,
  RefreshCw,
  BarChart3,
  Shield
} from 'lucide-react';
import { useUserHealthDashboard } from '@/hooks/admin/invites/useUserHealthDashboard';
import { useHealthCheckInitializer } from '@/hooks/admin/invites/useHealthCheckInitializer';
import { HealthCheckProgressDialog } from './HealthCheckProgressDialog';
import { toast } from 'sonner';

export const UserHealthDashboard = () => {
  const { 
    healthMetrics, 
    healthStats, 
    healthAlerts, 
    loading, 
    error, 
    refetch, 
    initializeHealthData,
    recalculateHealthScores 
  } = useUserHealthDashboard();

  const { progress, initialize, reset, isProcessing } = useHealthCheckInitializer();
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const handleInitializeData = async () => {
    try {
      setShowProgressDialog(true);
      reset();
      await initialize();
      // Recarregar dados após inicialização
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error: any) {
      toast.error('Erro na inicialização', {
        description: error.message
      });
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculateHealthScores();
      toast.success('Health scores recalculados com sucesso');
    } catch (error: any) {
      toast.error('Erro ao recalcular scores', {
        description: error.message
      });
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Health Check</h2>
            <p className="text-muted-foreground">Monitoramento de saúde dos usuários</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
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
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Health Check</h2>
            <p className="text-muted-foreground">Monitoramento de saúde dos usuários</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleInitializeData} disabled={isProcessing}>
              <Activity className="w-4 h-4 mr-2" />
              Inicializar Dados
            </Button>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Erro no Health Check
            </CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              O sistema de monitoramento de saúde ainda não foi inicializado ou encontrou um erro.
              Clique no botão acima para configurar o sistema.
            </p>
          </CardContent>
        </Card>

        <HealthCheckProgressDialog
          open={showProgressDialog}
          onOpenChange={setShowProgressDialog}
          progress={progress}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Health Check</h2>
          <p className="text-muted-foreground">Monitoramento de saúde dos usuários</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalculate} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalcular
          </Button>
          <Button onClick={handleInitializeData} disabled={isProcessing}>
            <Activity className="w-4 h-4 mr-2" />
            Reinicializar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários monitorados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Saudáveis</CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthStats?.healthyUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Score maior ou igual a 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{healthStats?.atRiskUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Score 30-69</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{healthStats?.criticalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Score menor que 30</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts */}
      {healthAlerts && healthAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Alertas de Saúde
            </CardTitle>
            <CardDescription>
              Usuários que precisam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getRiskLevelColor(alert.riskLevel)}>
                      {alert.riskLevel}
                    </Badge>
                    <div>
                      <p className="font-medium">{alert.userName}</p>
                      <p className="text-sm text-muted-foreground">{alert.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getHealthScoreColor(alert.healthScore)}`}>
                      {alert.healthScore}
                    </p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Métricas de Saúde
          </CardTitle>
          <CardDescription>
            Distribuição de scores de saúde dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthMetrics && healthMetrics.length > 0 ? (
            <div className="space-y-4">
              {healthMetrics.slice(0, 10).map((metric) => (
                <div key={metric.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {metric.user_profile?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{metric.user_profile?.name || 'Usuário'}</p>
                      <p className="text-sm text-muted-foreground">{metric.user_profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-semibold ${getHealthScoreColor(metric.health_score)}`}>
                        {metric.health_score}
                      </p>
                      <p className="text-xs text-muted-foreground">Health</p>
                    </div>
                    <div className="w-24">
                      <Progress value={metric.health_score} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma métrica encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Initialize o sistema para começar a monitorar a saúde dos usuários.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <HealthCheckProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        progress={progress}
      />
    </div>
  );
};
