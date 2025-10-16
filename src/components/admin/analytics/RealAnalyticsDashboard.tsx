
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, Users, Target, Activity } from 'lucide-react';
import { useEnhancedAnalyticsData } from '@/hooks/analytics/useEnhancedAnalyticsData';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { CompletionRateChart } from './CompletionRateChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';

export const RealAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { data, loading, error } = useEnhancedAnalyticsData(timeRange);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
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

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar Analytics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const metricCards = [
    {
      title: "Total de Usuários",
      value: data.metrics.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-operational"
    },
    {
      title: "Usuários Ativos (7d)",
      value: data.metrics.activeUsers.toLocaleString(),
      icon: Activity,
      color: "text-success"
    },
    {
      title: "Total Implementações",
      value: data.metrics.totalImplementations.toLocaleString(),
      icon: Target,
      color: "text-strategy"
    },
    {
      title: "Taxa de Conclusão",
      value: `${data.metrics.completionRate}%`,
      icon: TrendingUp,
      color: "text-warning"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Avançado</h1>
          <p className="text-muted-foreground">Dados reais da plataforma</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
            <SelectItem value="all">Tudo</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserGrowthChart data={data.usersByTime} />
        <PopularSolutionsChart data={data.solutionPopularity} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImplementationsByCategoryChart data={data.implementationsByCategory} />
        <CompletionRateChart data={data.userCompletionRate} />
        <WeeklyActivityChart data={data.dayOfWeekActivity} />
      </div>

      {/* Advanced Analytics Section */}
      {data.contentPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Conteúdo</CardTitle>
            <CardDescription>Conteúdo com melhor performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.contentPerformance.slice(0, 5).map((content, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{content.title}</div>
                    <div className="text-sm text-muted-foreground">{content.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{content.engagement}</div>
                    <div className="text-sm text-muted-foreground">{content.unit}</div>
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
