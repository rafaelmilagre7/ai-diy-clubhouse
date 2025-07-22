import { useState } from "react";
import { useRealAdminDashboardData } from "@/hooks/useRealAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, BarChart3, Users, FileText, GraduationCap, CheckCircle, TrendingUp, Activity, UserPlus, Zap } from "lucide-react";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";

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
    console.log('🔄 Atualizando dashboard manualmente...');
    await refetch();
    setLastRefresh(new Date());
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="space-y-8">
          <div className="aurora-glass rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-[400px]" />
            </div>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aurora-glass rounded-xl p-6">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 aurora-glass rounded-xl p-6">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="aurora-glass rounded-xl p-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!statsData || !activityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="space-y-6">
          <DashboardHeader 
            timeRange={timeRange}
            setTimeRange={handleTimeRangeChange}
          />
          
          <Card className="aurora-glass border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Erro ao Carregar Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
              </p>
              <Button onClick={handleRefresh} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="aurora-glass rounded-xl p-6 aurora-pulse">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold aurora-text-gradient">Dashboard Admin</h1>
              <p className="text-muted-foreground mt-1">
                Visão geral da plataforma VIVER DE IA Club
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="aurora-glass border-primary/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
          
          {/* Seletor de período */}
          <div className="mt-6">
            <DashboardHeader 
              timeRange={timeRange}
              setTimeRange={handleTimeRangeChange}
            />
          </div>
        </div>

        {/* Indicador do período ativo */}
        <div className="aurora-glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full aurora-glow"></div>
              <span className="text-foreground font-medium">
                Período ativo: <span className="aurora-text-gradient font-bold">{periodLabel}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {statsData.timeRange} • {new Date(statsData.lastUpdated).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            <h3 className="text-xl font-bold aurora-text-gradient">Dados Totais da Plataforma</h3>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4" key={`stats-grid-${timeRange}-${lastRefresh.getTime()}`}>
            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.totalUsers || 0).toLocaleString('pt-BR')}
                  </h3>
                  {(statsData?.periodGrowthRate || 0) > 0 && (
                    <div className="flex items-center mt-3">
                      <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
                      <span className="text-sm font-medium text-emerald-400">
                        +{statsData.periodGrowthRate}% no período
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 aurora-glow">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Soluções Publicadas</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.totalSolutions || 0).toLocaleString('pt-BR')}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 aurora-glow">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Aulas Publicadas</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.totalLearningLessons || 0).toLocaleString('pt-BR')}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 aurora-glow">
                  <GraduationCap className="h-6 w-6 text-indigo-500" />
                </div>
              </div>
            </div>

            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Implementações Completas</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.completedImplementations || 0).toLocaleString('pt-BR')}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 aurora-glow">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Atividade do Período */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
            <h3 className="text-xl font-bold aurora-text-gradient">
              Atividade dos Últimos {periodLabel}
            </h3>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4" key={`period-stats-${timeRange}-${lastRefresh.getTime()}`}>
            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Novos Usuários</p>
                  <p className="text-xs text-muted-foreground/70">({periodLabel})</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.newUsersInPeriod || 0).toLocaleString('pt-BR')}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 aurora-glow">
                  <UserPlus className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                  <p className="text-xs text-muted-foreground/70">({periodLabel})</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.activeUsersInPeriod || 0).toLocaleString('pt-BR')}
                  </h3>
                  {(statsData?.periodEngagementRate || 0) > 0 && (
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-blue-400">
                        {statsData.periodEngagementRate}% engajamento
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 aurora-glow">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Implementações</p>
                  <p className="text-xs text-muted-foreground/70">({periodLabel})</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.implementationsInPeriod || 0).toLocaleString('pt-BR')}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 aurora-glow">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </div>

            <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-xs text-muted-foreground/70">(do período)</p>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mt-2">
                    {(statsData?.periodCompletionRate || 0).toFixed(1)}%
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 aurora-glow">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded-full"></div>
            <h3 className="text-xl font-bold aurora-text-gradient">Atividades Recentes</h3>
          </div>

          <div className="aurora-glass rounded-xl aurora-hover-scale">
            <div className="p-6 space-y-4">
              {activityData.recentActivities?.length > 0 ? (
                activityData.recentActivities.map((activity, index) => (
                  <div 
                    key={`${activity.type}-${index}`} 
                    className="aurora-glass rounded-lg p-4 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{activity.type}</p>
                          <p className="text-sm text-muted-foreground">{activity.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white drop-shadow-lg">
                          {(activity?.count || 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="aurora-glass rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Activity className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h4>
                  <p className="text-muted-foreground text-sm">
                    Aguarde mais atividade dos usuários ou selecione um período maior
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Distribuição de Usuários */}
        {statsData.usersByRole && statsData.usersByRole.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h3 className="text-xl font-bold aurora-text-gradient">Distribuição de Usuários</h3>
            </div>

            <div className="aurora-glass rounded-xl p-6">
              <div className="space-y-4">
                {statsData.usersByRole.map((role, index) => (
                  <div 
                    key={index} 
                    className="aurora-glass rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary aurora-glow"></div>
                      <span className="font-semibold text-foreground">{role.role}</span>
                    </div>
                    <span className="text-white font-bold drop-shadow-lg">
                      {role.count} usuário{role.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;