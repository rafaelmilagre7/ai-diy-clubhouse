import { useState } from "react";
import { useRealAdminDashboardData } from "@/hooks/useRealAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminStatsCard } from "@/components/admin/ui/AdminStatsCard";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { OnboardingStatusCard } from "@/components/admin/OnboardingStatusCard";
import { RecentActivitiesCard } from "@/components/admin/analytics/RecentActivitiesCard";
import { NotificationHealthMonitor } from "@/components/admin/notifications/NotificationHealthMonitor";
import { devLog } from "@/utils/devLogger";

import { RefreshCw, Users, Activity, CheckCircle, TrendingUp, BarChart3, Zap, Star, Info } from "lucide-react";
import { VideoDurationSync } from "@/components/admin/VideoDurationSync";
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
    devLog.data(`Alterando período de ${timeRange} para ${newTimeRange}`);
    setTimeRange(newTimeRange);
    setLastRefresh(new Date()); // Força re-render
  };

  // Debug detalhado dos dados recebidos
  devLog.data('Estado atual:', {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
        
        <div className="relative p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-aurora-primary/20 to-operational/20 backdrop-blur-sm">
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
        
        <div className="relative p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-aurora-primary/20 to-operational/20 backdrop-blur-sm border border-aurora-primary/20">
                <BarChart3 className="h-8 w-8 text-aurora-primary" />
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
                <AdminButton 
                  onClick={handleRefresh} 
                  variant="outline"
                  icon={<RefreshCw />}
                >
                  Tentar Novamente
                </AdminButton>
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      
      <div className="relative p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Modern Aurora Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            
            <div className="flex items-center gap-3">
              <DashboardHeader timeRange={timeRange} setTimeRange={handleTimeRangeChange} />
              <AdminButton 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                icon={<RefreshCw />}
              >
                Atualizar
              </AdminButton>
            </div>
          </div>

          {/* Historical Data Warning */}
          {activityData?.dataMetadata?.isHistoricalData && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {activityData.dataMetadata.dataRangeDescription}
                  {activityData.dataMetadata.newestDataDate && (
                    <span className="ml-1">
                      (última atividade: {new Date(activityData.dataMetadata.newestDataDate).toLocaleDateString('pt-BR')})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Metrics Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4" key={`stats-grid-${timeRange}-${lastRefresh.getTime()}`}>
            <AdminStatsCard
              label="Novos Usuários"
              value={(statsData?.newUsersInPeriod || 0).toLocaleString('pt-BR')}
              icon={Users}
              variant="primary"
              trend={statsData?.periodGrowthRate ? `+${statsData.periodGrowthRate}%` : undefined}
              trendDirection={statsData?.periodGrowthRate && statsData.periodGrowthRate > 0 ? 'up' : undefined}
              description={`em ${periodLabel}`}
            />

            <AdminStatsCard
              label="Usuários Ativos"
              value={(statsData?.activeUsersInPeriod || 0).toLocaleString('pt-BR')}
              icon={Activity}
              variant="success"
              description={`ativos em ${periodLabel}`}
            />

            <AdminStatsCard
              label="Implementações"
              value={(statsData?.implementationsInPeriod || 0).toLocaleString('pt-BR')}
              icon={BarChart3}
              variant="info"
              description={`iniciadas em ${periodLabel}`}
            />

            <AdminStatsCard
              label="Implementações Completas"
              value={(statsData?.completedInPeriod || 0).toLocaleString('pt-BR')}
              icon={CheckCircle}
              variant="success"
              description={`finalizadas em ${periodLabel}`}
            />
          </div>

          {/* Enhanced Detail Cards */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            
            {/* Card de Status do Onboarding */}
            <OnboardingStatusCard />
            
            
            {/* Card de Dados Gerais */}
            <AdminCard
              title="Dados Gerais da Plataforma"
              variant="elevated"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 p-3 rounded-lg bg-aurora-primary/5">
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
            </AdminCard>

            {/* Card de Usuários por Role */}
            <AdminCard
              title="Usuários por Categoria"
              variant="elevated"
            >
              <div className="space-y-3">
                {statsData?.usersByRole?.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg surface-elevated">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-aurora-primary to-operational"></div>
                      <span className="text-label text-foreground">{role.role}</span>
                    </div>
                    <span className="text-label text-foreground">
                      {role.count} usuário{role.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>

          {/* Enhanced Activities with New Component */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <RecentActivitiesCard 
              activities={activityData?.recentActivities || []}
              loading={loading}
            />
            
            {/* Card de Estatísticas Adicionais */}
            <AdminCard
              title="Estatísticas do Período"
              variant="elevated"
            >
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-aurora-primary/5">
                  <span className="text-label text-muted-foreground">Taxa de Crescimento</span>
                  <span className="text-heading-3 text-aurora-primary">
                    {statsData?.periodGrowthRate ? `+${statsData.periodGrowthRate}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-operational/5">
                  <span className="text-label text-muted-foreground">Taxa de Conclusão</span>
                  <span className="text-heading-3 text-operational">
                    {statsData?.completedInPeriod && statsData?.implementationsInPeriod 
                      ? `${Math.round((statsData.completedInPeriod / statsData.implementationsInPeriod) * 100)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-strategy/5">
                  <span className="text-label text-muted-foreground">Usuários/Implementação</span>
                  <span className="text-heading-3 text-strategy">
                    {statsData?.activeUsersInPeriod && statsData?.implementationsInPeriod
                      ? Math.round(statsData.activeUsersInPeriod / Math.max(statsData.implementationsInPeriod, 1))
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Monitor de Notificações */}
          <div className="grid gap-6 grid-cols-1">
            <NotificationHealthMonitor />
          </div>

          {/* Sincronização de Durações dos Vídeos */}
          <div className="grid gap-6 grid-cols-1">
            <VideoDurationSync />
          </div>
        </div>
      </div>
    </div>;
};
export default AdminDashboard;