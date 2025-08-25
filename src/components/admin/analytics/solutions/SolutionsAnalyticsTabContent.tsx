
import React from 'react';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
  const solutionMetrics = [
    {
      title: "Total de Soluções",
      value: data?.solutions_count || 0,
      icon: FileText,
      description: "Soluções ativas na plataforma",
      color: "text-blue-500",
      trend: null
    },
    {
      title: "Implementações Ativas",
      value: data?.total_implementations || 0,
      icon: TrendingUp,
      description: "Em andamento ou concluídas",
      color: "text-green-500",
      trend: null
    },
    {
      title: "Taxa de Conclusão",
      value: data?.completed_implementations && data?.total_implementations 
        ? `${Math.round((data.completed_implementations / data.total_implementations) * 100)}%`
        : "0%",
      icon: Target,
      description: "Implementações concluídas",
      color: "text-purple-500",
      trend: null
    },
    {
      title: "Usuários Ativos",
      value: data?.active_users || 0,
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
          colors={['#0ABAB5']}
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
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
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
          colors={['#10B981']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="large"
          curved={true}
        />
      </AnalyticsChartsGrid>
    </AnalyticsTabContainer>
  );
};
