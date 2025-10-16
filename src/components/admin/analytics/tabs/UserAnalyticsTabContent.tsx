
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, UserPlus, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, PieChart, AreaChart } from '@/components/ui/chart';
import { useUserAnalyticsData } from '@/hooks/analytics/useUserAnalyticsData';

interface UserAnalyticsTabContentProps {
  timeRange: string;
}

export const UserAnalyticsTabContent = ({ timeRange }: UserAnalyticsTabContentProps) => {
  const { data, loading, error } = useUserAnalyticsData({ 
    timeRange, 
    role: 'all' 
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados de usuários</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const userStatsCards = [
    {
      title: "Total de Usuários",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-operational",
      bgColor: "bg-operational/10 dark:bg-operational/20"
    },
    {
      title: "Usuários Ativos (7d)",
      value: data.activeUsers.toLocaleString(),
      icon: Activity,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Novos Usuários",
      value: data.usersByTime.length > 0 
        ? data.usersByTime[data.usersByTime.length - 1]?.novos?.toLocaleString() || '0'
        : '0',
      icon: UserPlus,
      color: "text-strategy",
      bgColor: "bg-strategy/10"
    },
    {
      title: "Taxa de Engajamento",
      value: data.totalUsers > 0 ? `${Math.round((data.activeUsers / data.totalUsers) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-revenue",
      bgColor: "bg-revenue/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStatsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-md flex items-center justify-center ${stat.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeRange === '30d' ? 'Últimos 30 dias' : 
                   timeRange === '7d' ? 'Últimos 7 dias' : 
                   'Todo período'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Crescimento de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>
              Evolução do número de usuários ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.usersByTime.length > 0 ? (
                <AreaChart
                  data={data.usersByTime}
                  index="name"
                  categories={["novos", "total"]}
                  colors={["hsl(var(--aurora-primary))", "hsl(var(--info))"]}
                  valueFormatter={(value) => `${value} usuários`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de crescimento disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Papel */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Papel</CardTitle>
            <CardDescription>
              Divisão dos usuários por tipos de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.userRoleDistribution.length > 0 ? (
                <PieChart
                  data={data.userRoleDistribution}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} usuários`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de distribuição disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Atividade Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade por Dia da Semana</CardTitle>
          <CardDescription>
            Padrão de atividade dos usuários durante a semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {data.userActivityByDay.length > 0 ? (
              <BarChart
                data={data.userActivityByDay}
                index="day"
                categories={["atividade"]}
                colors={["hsl(var(--secondary))"]}
                valueFormatter={(value) => `${value} atividades`}
                layout="vertical"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sem dados de atividade disponíveis
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
