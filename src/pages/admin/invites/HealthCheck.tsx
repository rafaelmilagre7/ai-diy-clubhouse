
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingDown,
  Heart,
  BarChart3
} from 'lucide-react';
import { useHealthCheckData } from '@/hooks/admin/useHealthCheckData';
import { useAtRiskUsers } from '@/hooks/admin/useAtRiskUsers';
import { HealthCheckInitButton } from '@/components/admin/invites/health/HealthCheckInitButton';
import { toast } from 'sonner';

const HealthCheck = () => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { 
    healthMetrics, 
    stats, 
    loading, 
    error, 
    refetch, 
    recalculateHealthScores 
  } = useHealthCheckData();
  
  const { 
    atRiskUsers, 
    loading: atRiskLoading, 
    triggerIntervention 
  } = useAtRiskUsers();

  const handleRefresh = async () => {
    try {
      await refetch();
      setLastRefresh(new Date());
      toast.success('Dados atualizados com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculateHealthScores();
      toast.success('Health scores recalculados');
      setLastRefresh(new Date());
    } catch (error) {
      toast.error('Erro ao recalcular scores');
    }
  };

  const handleIntervention = async (userId: string) => {
    try {
      await triggerIntervention(userId);
      toast.success('Intervenção agendada com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao agendar intervenção');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Carregando dados de saúde...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Health Check dos Usuários</h1>
            <p className="text-muted-foreground">
              Sistema de monitoramento de saúde e engajamento
            </p>
          </div>
          <HealthCheckInitButton onInitialized={refetch} />
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Sistema não inicializado
            </CardTitle>
            <CardDescription>
              O Health Check precisa ser inicializado antes do primeiro uso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão "Inicializar Health Check" para configurar o sistema 
              e popular os dados iniciais dos usuários.
            </p>
            <HealthCheckInitButton onInitialized={refetch} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Health Check dos Usuários</h1>
          <p className="text-muted-foreground">
            Monitoramento de saúde e engajamento dos usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={loading}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Recalcular
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
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
                Usuários monitorados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Saudáveis</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.healthyUsers}</div>
              <p className="text-xs text-muted-foreground">
                Score ≥ 70 pontos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.atRiskUsers}</div>
              <p className="text-xs text-muted-foreground">
                Score 30-69 pontos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Score &lt; 30 pontos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Score Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Saúde Geral do Sistema
            </CardTitle>
            <CardDescription>
              Score médio: {stats.averageHealthScore} pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score Médio de Saúde</span>
                  <span>{stats.averageHealthScore}/100</span>
                </div>
                <Progress value={stats.averageHealthScore} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score Médio de Engajamento</span>
                  <span>{stats.averageEngagementScore}/100</span>
                </div>
                <Progress value={stats.averageEngagementScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* At Risk Users */}
      {atRiskUsers && atRiskUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Usuários Que Precisam de Atenção
            </CardTitle>
            <CardDescription>
              {atRiskUsers.length} usuários com baixo engajamento detectados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskUsers.slice(0, 5).map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{user.user_profile.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          user.risk_level === 'critical' ? 'destructive' :
                          user.risk_level === 'high' ? 'default' : 'secondary'
                        }
                      >
                        {user.risk_level === 'critical' ? 'Crítico' :
                         user.risk_level === 'high' ? 'Alto Risco' : 'Médio Risco'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {Math.round(user.health_score)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleIntervention(user.user_id)}
                    disabled={atRiskLoading}
                  >
                    Intervir
                  </Button>
                </div>
              ))}
              
              {atRiskUsers.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  E mais {atRiskUsers.length - 5} usuários...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Update Info */}
      <div className="text-xs text-muted-foreground text-center">
        Última atualização: {lastRefresh.toLocaleString('pt-BR')}
        {stats?.lastUpdated && (
          <span className="ml-2">
            • Dados do sistema: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
};

export default HealthCheck;
