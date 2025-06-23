
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Play,
  BarChart3,
  Shield
} from 'lucide-react';
import { useUserHealthDashboard } from '@/hooks/admin/invites/useUserHealthDashboard';
import { useHealthCheckInitializer } from '@/hooks/admin/invites/useHealthCheckInitializer';
import { HealthCheckProgressDialog } from './HealthCheckProgressDialog';

export const UserHealthDashboard = () => {
  const { 
    healthMetrics, 
    stats, 
    atRiskUsers,
    alerts,
    loading, 
    error, 
    refetch,
    recalculateHealthScores
  } = useUserHealthDashboard();

  const {
    progress,
    initialize,
    reset,
    isProcessing
  } = useHealthCheckInitializer();

  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const handleInitialize = async () => {
    setShowProgressDialog(true);
    await initialize();
  };

  const handleCloseProgress = () => {
    setShowProgressDialog(false);
    reset();
    refetch(); // Atualizar dados após inicialização
  };

  const handleRecalculate = async () => {
    try {
      await recalculateHealthScores();
    } catch (error) {
      console.error('Erro ao recalcular:', error);
    }
  };

  // Dados simulados se não houver dados reais
  const displayStats = stats || {
    totalUsers: 0,
    healthyUsers: 0,
    atRiskUsers: 0,
    criticalUsers: 0,
    averageHealthScore: 0,
    averageEngagementScore: 0,
    lastUpdated: new Date().toISOString()
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Health Check Dashboard</h2>
            <p className="text-muted-foreground">
              Monitoramento de saúde e engajamento dos usuários
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Health Check Dashboard</h2>
            <p className="text-muted-foreground">
              Monitoramento de saúde e engajamento dos usuários
            </p>
          </div>
          <Button onClick={handleInitialize} className="gap-2">
            <Play className="h-4 w-4" />
            Inicializar Health Check
          </Button>
        </div>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sistema não inicializado
            </CardTitle>
            <CardDescription className="text-orange-700">
              O Health Check precisa ser inicializado para funcionar corretamente.
              Clique no botão "Inicializar Health Check" para começar.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Check Dashboard</h2>
          <p className="text-muted-foreground">
            Monitoramento de saúde e engajamento dos usuários
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={loading}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Recalcular
          </Button>

          <Button
            onClick={handleInitialize}
            disabled={isProcessing}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isProcessing ? 'Processando...' : 'Inicializar'}
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Usuários
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {displayStats.totalUsers}
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500 bg-blue-100 p-2 rounded-md" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Usuários Saudáveis
                </CardTitle>
                <div className="text-2xl font-bold mt-1 text-green-600">
                  {displayStats.healthyUsers}
                </div>
              </div>
              <Shield className="h-8 w-8 text-green-500 bg-green-100 p-2 rounded-md" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Em Risco
                </CardTitle>
                <div className="text-2xl font-bold mt-1 text-yellow-600">
                  {displayStats.atRiskUsers}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 bg-yellow-100 p-2 rounded-md" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Críticos
                </CardTitle>
                <div className="text-2xl font-bold mt-1 text-red-600">
                  {displayStats.criticalUsers}
                </div>
              </div>
              <Activity className="h-8 w-8 text-red-500 bg-red-100 p-2 rounded-md" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários em Risco</TabsTrigger>
          <TabsTrigger value="alerts">Alertas Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Score Médio de Saúde</CardTitle>
                <CardDescription>
                  Média geral de saúde dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">
                      {displayStats.averageHealthScore}%
                    </span>
                    <Badge variant={displayStats.averageHealthScore >= 70 ? 'default' : 'destructive'}>
                      {displayStats.averageHealthScore >= 70 ? 'Bom' : 'Atenção'}
                    </Badge>
                  </div>
                  <Progress value={displayStats.averageHealthScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score de Engajamento</CardTitle>
                <CardDescription>
                  Nível médio de engajamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">
                      {displayStats.averageEngagementScore}%
                    </span>
                    <Badge variant={displayStats.averageEngagementScore >= 60 ? 'default' : 'secondary'}>
                      {displayStats.averageEngagementScore >= 60 ? 'Ativo' : 'Baixo'}
                    </Badge>
                  </div>
                  <Progress value={displayStats.averageEngagementScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários que Precisam de Atenção</CardTitle>
              <CardDescription>
                Lista de usuários com baixo score de saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Nenhum usuário em risco!</p>
                  <p className="text-sm">Todos os usuários estão com boa saúde no sistema.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskUsers.slice(0, 5).map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.user_profile.name}</p>
                        <p className="text-sm text-muted-foreground">{user.user_profile.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          user.risk_level === 'critical' ? 'destructive' :
                          user.risk_level === 'high' ? 'secondary' : 'outline'
                        }>
                          {user.risk_level === 'critical' ? 'Crítico' :
                           user.risk_level === 'high' ? 'Alto' : 'Médio'}
                        </Badge>
                        <span className="text-sm font-medium">
                          {user.health_score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
              <CardDescription>
                Notificações e alertas ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <p className="text-lg font-medium">Sistema funcionando normalmente</p>
                  <p className="text-sm">Nenhum alerta ativo no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {alert.severity === 'high' ? 'Alto' : 
                         alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <HealthCheckProgressDialog
        open={showProgressDialog}
        onOpenChange={handleCloseProgress}
        progress={progress}
        onCancel={() => {
          setShowProgressDialog(false);
          reset();
        }}
      />
    </div>
  );
};
