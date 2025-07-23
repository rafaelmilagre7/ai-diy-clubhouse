import { useState } from "react";
import { useRealAdminDashboardData } from "@/hooks/useRealAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { OnboardingStatusCard } from "@/components/admin/OnboardingStatusCard";
import { RefreshCw, Users, Activity, CheckCircle, TrendingUp, BarChart3 } from "lucide-react";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const {
    statsData,
    activityData,
    loading,
    refetch
  } = useRealAdminDashboardData(timeRange);

  // Handler que força atualização quando timeRange muda
  const handleTimeRangeChange = (newTimeRange: string) => {
    console.log(`🔄 [DASHBOARD] Alterando período de ${timeRange} para ${newTimeRange}`);
    setTimeRange(newTimeRange);
    setLastRefresh(new Date()); // Força re-render
  };

  // Debug detalhado dos dados recebidos
  console.log('📊 [DASHBOARD] Estado atual:', {
    timeRange,
    statsData: statsData ? {
      newUsersInPeriod: statsData.newUsersInPeriod,
      activeUsersInPeriod: statsData.activeUsersInPeriod,
      periodGrowthRate: statsData.periodGrowthRate,
      timeRange: statsData.timeRange
    } : null,
    loading,
    lastRefresh: lastRefresh.toISOString()
  });

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-3" />
                <Skeleton className="h-4 w-20" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!statsData || !activityData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-1">Erro ao carregar dados</p>
          </div>
          
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Erro de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
              </p>
              <Button onClick={handleRefresh} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calcular período atual para labels
  const periodDays = timeRange === '7d' ? 7 :
                    timeRange === '30d' ? 30 :
                    timeRange === '90d' ? 90 :
                    timeRange === 'all' ? 365 : 30;

  const periodLabel = periodDays === 7 ? '7 dias' :
                     periodDays === 30 ? '30 dias' :
                     periodDays === 90 ? '90 dias' :
                     periodDays === 365 ? 'Todo período' : `${periodDays} dias`;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Moderno */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Período: {periodLabel}</span>
              <span>•</span>
              <span>Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DashboardHeader 
              timeRange={timeRange}
              setTimeRange={handleTimeRangeChange}
            />
            <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4" key={`stats-grid-${timeRange}-${lastRefresh.getTime()}`}>
          
          {/* Novos Usuários */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Novos Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(statsData?.newUsersInPeriod || 0).toLocaleString('pt-BR')}
              </div>
              {(statsData?.periodGrowthRate || 0) > 0 && (
                <div className="flex items-center text-xs text-emerald-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{statsData.periodGrowthRate}% crescimento
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                em {periodLabel}
              </p>
            </CardContent>
          </Card>

          {/* Usuários Ativos */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuários Ativos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(statsData?.activeUsersInPeriod || 0).toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ativos em {periodLabel}
              </p>
            </CardContent>
          </Card>

          {/* Implementações */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Implementações
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(statsData?.implementationsInPeriod || 0).toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                iniciadas em {periodLabel}
              </p>
            </CardContent>
          </Card>

          {/* Implementações Completas */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Implementações Completas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(statsData?.completedInPeriod || 0).toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                finalizadas em {periodLabel}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          
          {/* Card de Status do Onboarding */}
          <OnboardingStatusCard />
          
          {/* Card de Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Dados Gerais da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{(statsData?.totalUsers || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total de Soluções</p>
                  <p className="text-2xl font-bold">{(statsData?.totalSolutions || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total de Aulas</p>
                  <p className="text-2xl font-bold">{(statsData?.totalLearningLessons || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Implementações</p>
                  <p className="text-2xl font-bold">{(statsData?.completedImplementations || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Usuários por Role */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Usuários por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsData?.usersByRole?.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium text-foreground">{role.role}</span>
                    </div>
                    <span className="font-bold text-foreground">
                      {role.count} usuário{role.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atividades Recentes */}
        {activityData?.recentActivities && activityData.recentActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityData.recentActivities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;