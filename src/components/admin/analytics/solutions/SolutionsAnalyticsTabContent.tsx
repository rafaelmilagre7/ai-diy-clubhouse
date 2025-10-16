
import React from 'react';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DataStatusIndicator } from '../DataStatusIndicator';
import { AlertTriangle, FileText, TrendingUp, Target, BarChart3, CheckCircle, Clock, Users } from 'lucide-react';

interface SolutionsAnalyticsTabContentProps {
  timeRange: string;
}

export const SolutionsAnalyticsTabContent = ({ timeRange }: SolutionsAnalyticsTabContentProps) => {
  const { data, loading, error } = useAnalyticsData({
    timeRange,
    category: 'all',
    difficulty: 'all'
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados de soluções</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Calcular métricas baseadas nos dados reais
  const totalSolutions = data?.solutionPopularity?.length || 0;
  const totalImplementations = data?.userCompletionRate?.reduce((acc, item) => acc + item.value, 0) || 0;
  const completedImplementations = data?.userCompletionRate?.find(item => item.name === 'Concluídas')?.value || 0;
  const activeUsers = data?.usersByTime?.length || 0;
  
  const solutionMetrics = [
    {
      title: "Total de Soluções",
      value: totalSolutions,
      icon: FileText,
      description: "Soluções ativas na plataforma",
      color: "text-operational",
      trend: null
    },
    {
      title: "Implementações Ativas",
      value: totalImplementations,
      icon: TrendingUp,
      description: "Em andamento ou concluídas",
      color: "text-green-500",
      trend: null
    },
    {
      title: "Taxa de Conclusão",
      value: totalImplementations > 0 
        ? `${Math.round((completedImplementations / totalImplementations) * 100)}%`
        : "0%",
      icon: Target,
      description: "Implementações concluídas",
      color: "text-purple-500",
      trend: null
    },
    {
      title: "Usuários Ativos",
      value: activeUsers,
      icon: Users,
      description: "Implementando soluções",
      color: "text-orange-500",
      trend: null
    }
  ];

  return (
    <AnalyticsTabContainer>
      {/* Metric Cards */}
      <AnalyticsMetricsGrid columns={3}>
        {solutionMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <DataStatusIndicator isDataReal={!loading && !error} loading={loading} error={error} />
              </div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </AnalyticsMetricsGrid>

      {/* Charts */}
      <AnalyticsChartsGrid>
        <EnhancedBarChart
          data={data?.solutionPopularity || []}
          title="Soluções Mais Populares"
          description="Ranking das soluções por número de implementações"
          categories={['value']}
          index="name"
          colors={['hsl(var(--aurora-primary))']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          layout="vertical"
        />
        
        <EnhancedPieChart
          data={data?.implementationsByCategory || []}
          title="Distribuição por Categoria"
          description="Implementações organizadas por área de negócio"
          category="value"
          index="name"
          colors={['hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--secondary))']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          showLegend={true}
        />
      </AnalyticsChartsGrid>
      
      {/* User Progress Chart */}
      <AnalyticsChartsGrid columns={1}>
        <EnhancedAreaChart
          data={data?.userCompletionRate || []}
          title="Progresso de Implementações"
          description="Status de conclusão das implementações dos usuários"
          categories={['value']}
          index="name"
          colors={['hsl(var(--success))']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="large"
          curved={true}
        />
      </AnalyticsChartsGrid>
    </AnalyticsTabContainer>
  );
};
