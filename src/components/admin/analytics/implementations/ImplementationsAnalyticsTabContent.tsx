
import React from 'react';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, PlayCircle, CheckCircle, Clock, TrendingUp, Users, Target, Activity } from 'lucide-react';

interface ImplementationsAnalyticsTabContentProps {
  timeRange: string;
}

export const ImplementationsAnalyticsTabContent = ({ timeRange }: ImplementationsAnalyticsTabContentProps) => {
  const { data, loading, error } = useAnalyticsData({
    timeRange,
    category: 'all',
    difficulty: 'all'
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados de implementações</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Calcular métricas baseadas nos dados disponíveis
  const totalImplementations = data?.implementationsByCategory?.reduce((sum, cat) => sum + cat.value, 0) || 0;
  const completedImplementations = data?.userCompletionRate?.find(item => item.name === 'Concluídas')?.value || 0;
  const inProgressImplementations = data?.userCompletionRate?.find(item => item.name === 'Em andamento')?.value || 0;
  const completionRate = totalImplementations > 0 
    ? Math.round((completedImplementations / (completedImplementations + inProgressImplementations)) * 100) 
    : 0;

  const metrics = [
    {
      title: "Total de Implementações",
      value: totalImplementations,
      icon: <PlayCircle className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      trend: { value: 18, label: "crescimento mensal" }
    },
    {
      title: "Implementações Concluídas",
      value: completedImplementations,
      icon: <CheckCircle className="h-5 w-5" />,
      colorScheme: 'green' as const,
      trend: { value: 12, label: "finalizações por semana" }
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      trend: { value: 6, label: "melhoria contínua" }
    },
    {
      title: "Em Andamento",
      value: inProgressImplementations,
      icon: <Activity className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      trend: { value: 22, label: "novas implementações" }
    },
    {
      title: "Tempo Médio Conclusão",
      value: "4.2 dias",
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      trend: { value: -15, label: "otimização de processo" }
    },
    {
      title: "Usuários Ativos",
      value: "156",
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      trend: { value: 9, label: "engajamento alto" }
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
        <EnhancedPieChart
          data={data?.userCompletionRate || []}
          title="Status das Implementações"
          description="Distribuição entre implementações concluídas e em andamento"
          category="value"
          index="name"
          colors={['#10B981', '#F59E0B']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          showLegend={true}
        />
        
        <EnhancedBarChart
          data={data?.implementationsByCategory || []}
          title="Implementações por Categoria"
          description="Distribuição das implementações por área de negócio"
          categories={['value']}
          index="name"
          colors={['#3B82F6']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          layout="horizontal"
        />
      </AnalyticsChartsGrid>
      
      {/* Activity by Day Chart */}
      <AnalyticsChartsGrid columns={1}>
        <EnhancedAreaChart
          data={data?.dayOfWeekActivity || []}
          title="Atividade de Implementação por Dia"
          description="Padrão de atividade das implementações ao longo da semana"
          categories={['atividade']}
          index="day"
          colors={['#8B5CF6']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          size="large"
          curved={true}
        />
      </AnalyticsChartsGrid>
    </AnalyticsTabContainer>
  );
};
