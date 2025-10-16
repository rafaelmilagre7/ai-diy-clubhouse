
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, Target, TrendingUp, Activity } from 'lucide-react';
import { useRealAdminAnalytics } from '@/hooks/admin/useRealAdminAnalytics';

interface RealAnalyticsOverviewProps {
  timeRange: string;
}

export const RealAnalyticsOverview = ({ timeRange }: RealAnalyticsOverviewProps) => {
  const { data, loading, error } = useRealAdminAnalytics(timeRange);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertTitle className="text-neutral-800 dark:text-white">Erro ao carregar dados</AlertTitle>
        <AlertDescription className="text-neutral-700 dark:text-neutral-300">
          {error || 'Não foi possível carregar os dados de analytics. Tente novamente.'}
        </AlertDescription>
      </Alert>
    );
  }

  const metricCards = [
    {
      title: "Total de Usuários",
      value: data.overview.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-operational"
    },
    {
      title: "Usuários Ativos (7d)",
      value: data.overview.activeUsers.toLocaleString(),
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Implementações Completas",
      value: data.overview.completedImplementations.toLocaleString(),
      icon: Target,
      color: "text-purple-500"
    },
    {
      title: "Taxa de Conclusão",
      value: `${data.overview.overallCompletionRate}%`,
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserGrowthChart data={data.userGrowth} />
        <PopularSolutionsChart data={data.solutionPopularity} />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImplementationsByCategoryChart data={data.implementationsByCategory} />
        <WeeklyActivityChart data={data.weeklyActivity} />
      </div>

      {/* User Distribution Summary */}
      {data.userRoleDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Usuários por Tipo</CardTitle>
            <CardDescription>
              Breakdown dos usuários por papel na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.userRoleDistribution.map((role, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-muted-foreground">{role.percentage}% do total</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{role.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">usuários</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
