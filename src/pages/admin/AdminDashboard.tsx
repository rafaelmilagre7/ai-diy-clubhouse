import { useState } from "react";
import { useRealAdminDashboardData } from "@/hooks/useRealAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { OnboardingStatusCard } from "@/components/admin/OnboardingStatusCard";
import { RefreshCw, Users, Activity, CheckCircle, TrendingUp, BarChart3, Zap, Star } from "lucide-react";
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

  // Loading state with Aurora design
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
        
        <div className="relative p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-viverblue/20 to-operational/20 backdrop-blur-sm">
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({
              length: 4
            }).map((_, i) => <Card key={i} className="surface-elevated border-0 shadow-aurora p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-3" />
                  <Skeleton className="h-4 w-20" />
                </Card>)}
            </div>
          </div>
        </div>
      </div>;
  }

  // Error state with Aurora design
  if (!statsData || !activityData) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
        
        <div className="relative p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-viverblue/20 to-operational/20 backdrop-blur-sm border border-viverblue/20">
                <BarChart3 className="h-8 w-8 text-viverblue" />
              </div>
              <div>
                <h1 className="text-display text-foreground">Dashboard Admin</h1>
                <p className="text-body-large text-muted-foreground">Erro ao carregar dados</p>
              </div>
            </div>
            
            <Card className="surface-elevated border-0 shadow-aurora bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Erro de Conexão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-muted-foreground mb-4">
                  Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
                </p>
                <Button onClick={handleRefresh} variant="outline" className="gap-2 aurora-focus">
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>;
  }

  // Calcular período atual para labels
  const periodDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === 'all' ? 365 : 30;
  const periodLabel = periodDays === 7 ? '7 dias' : periodDays === 30 ? '30 dias' : periodDays === 90 ? '90 dias' : periodDays === 365 ? 'Todo período' : `${periodDays} dias`;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-viverblue/10 to-operational/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-strategy/10 to-revenue/10 blur-3xl animate-blob animation-delay-2000" />
      
      <div className="relative p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Modern Aurora Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            
            <div className="flex items-center gap-3">
              <DashboardHeader timeRange={timeRange} setTimeRange={handleTimeRangeChange} />
              <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 aurora-focus bg-viverblue/10 border-viverblue/20 hover:bg-viverblue/20">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Enhanced Metrics Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4" key={`stats-grid-${timeRange}-${lastRefresh.getTime()}`}>
            
            {/* Novos Usuários */}
            <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label text-muted-foreground">
                  Novos Usuários
                </CardTitle>
                <div className="p-2 rounded-lg bg-viverblue/10 group-hover:bg-viverblue/20 transition-colors">
                  <Users className="h-4 w-4 text-viverblue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-heading-2 text-foreground mb-2">
                  {(statsData?.newUsersInPeriod || 0).toLocaleString('pt-BR')}
                </div>
                {(statsData?.periodGrowthRate || 0) > 0 && <div className="flex items-center text-caption text-emerald-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{statsData.periodGrowthRate}% crescimento
                  </div>}
                <p className="text-caption text-muted-foreground mt-1">
                  em {periodLabel}
                </p>
              </CardContent>
            </Card>

            {/* Usuários Ativos */}
            <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label text-muted-foreground">
                  Usuários Ativos
                </CardTitle>
                <div className="p-2 rounded-lg bg-operational/10 group-hover:bg-operational/20 transition-colors">
                  <Activity className="h-4 w-4 text-operational" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-heading-2 text-foreground mb-2">
                  {(statsData?.activeUsersInPeriod || 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-caption text-muted-foreground">
                  ativos em {periodLabel}
                </p>
              </CardContent>
            </Card>

            {/* Implementações */}
            <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label text-muted-foreground">
                  Implementações
                </CardTitle>
                <div className="p-2 rounded-lg bg-strategy/10 group-hover:bg-strategy/20 transition-colors">
                  <BarChart3 className="h-4 w-4 text-strategy" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-heading-2 text-foreground mb-2">
                  {(statsData?.implementationsInPeriod || 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-caption text-muted-foreground">
                  iniciadas em {periodLabel}
                </p>
              </CardContent>
            </Card>

            {/* Implementações Completas */}
            <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label text-muted-foreground">
                  Implementações Completas
                </CardTitle>
                <div className="p-2 rounded-lg bg-revenue/10 group-hover:bg-revenue/20 transition-colors">
                  <CheckCircle className="h-4 w-4 text-revenue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-heading-2 text-foreground mb-2">
                  {(statsData?.completedInPeriod || 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-caption text-muted-foreground">
                  finalizadas em {periodLabel}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Detail Cards */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            
            {/* Card de Status do Onboarding */}
            <OnboardingStatusCard />
            
            {/* Card de Dados Gerais */}
            <Card className="surface-elevated border-0 shadow-aurora">
              <CardHeader>
                <CardTitle className="text-heading-3">Dados Gerais da Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-lg bg-viverblue/5">
                    <p className="text-label text-muted-foreground">Total de Usuários</p>
                    <p className="text-heading-2">{(statsData?.totalUsers || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-operational/5">
                    <p className="text-label text-muted-foreground">Total de Soluções</p>
                    <p className="text-heading-2">{(statsData?.totalSolutions || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-strategy/5">
                    <p className="text-label text-muted-foreground">Total de Aulas</p>
                    <p className="text-heading-2">{(statsData?.totalLearningLessons || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-revenue/5">
                    <p className="text-label text-muted-foreground">Total Implementações</p>
                    <p className="text-heading-2">{(statsData?.completedImplementations || 0).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Usuários por Role */}
            <Card className="surface-elevated border-0 shadow-aurora">
              <CardHeader>
                <CardTitle className="text-heading-3">Usuários por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData?.usersByRole?.map((role, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg surface-elevated">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-viverblue to-operational"></div>
                        <span className="text-label text-foreground">{role.role}</span>
                      </div>
                      <span className="text-label text-foreground">
                        {role.count} usuário{role.count !== 1 ? 's' : ''}
                      </span>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Activities */}
          {activityData?.recentActivities && activityData.recentActivities.length > 0 && <Card className="surface-elevated border-0 shadow-aurora">
              <CardHeader>
                <CardTitle className="text-heading-3">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityData.recentActivities.slice(0, 5).map((activity: any, index: number) => <div key={index} className="flex items-center gap-3 p-3 rounded-lg surface-elevated hover:bg-viverblue/5 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-viverblue to-operational"></div>
                      <div className="flex-1">
                        <p className="text-label">{activity.type}</p>
                        <p className="text-caption text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-caption text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>)}
                </div>
              </CardContent>
            </Card>}
        </div>
      </div>
    </div>;
};
export default AdminDashboard;