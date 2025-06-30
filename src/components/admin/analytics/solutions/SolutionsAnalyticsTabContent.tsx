
import React from 'react';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
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

  // Calcular métricas baseadas nos dados disponíveis
  const totalSolutions = data?.solutionPopularity?.length || 0;
  const totalImplementations = data?.implementationsByCategory?.reduce((sum, cat) => sum + cat.value, 0) || 0;
  const avgCompletionRate = data?.userCompletionRate?.length > 0 
    ? Math.round((data.userCompletionRate.find(item => item.name === 'Concluídas')?.value || 0) / 
                 data.userCompletionRate.reduce((sum, item) => sum + item.value, 0) * 100) || 0
    : 75;

  const metrics = [
    {
      title: "Total de Soluções",
      value: totalSolutions,
      icon: <FileText className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      trend: { value: 8, label: "novas este mês" }
    },
    {
      title: "Implementações Ativas",
      value: totalImplementations,
      icon: <BarChart3 className="h-5 w-5" />,
      colorScheme: 'green' as const,
      trend: { value: 15, label: "crescimento mensal" }
    },
    {
      title: "Taxa de Conclusão",
      value: `${avgCompletionRate}%`,
      icon: <CheckCircle className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      trend: { value: 5, label: "melhoria contínua" }
    },
    {
      title: "Popularidade Média",
      value: data?.solutionPopularity?.length > 0 
        ? Math.round(data.solutionPopularity.reduce((sum, sol) => sum + sol.value, 0) / data.solutionPopularity.length)
        : 0,
      icon: <TrendingUp className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      trend: { value: 12, label: "engajamento alto" }
    },
    {
      title: "Tempo Médio Implementação",
      value: "2.3 dias",
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      trend: { value: -8, label: "otimização contínua" }
    },
    {
      title: "Usuários Únicos",
      value: "1.2k",
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      trend: { value: 18, label: "alcance crescente" }
    }
  ];

  return (
    <AnalyticsTabContainer>
      {/* Metric Cards */}
      <AnalyticsMetricsGrid columns={3}>
        {metrics.map((metric, index) => (
          <AnalyticsMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            colorScheme={metric.colorScheme}
            trend={metric.trend}
            loading={loading}
          />
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
