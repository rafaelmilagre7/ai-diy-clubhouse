
import React from 'react';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DataStatusIndicator } from '../DataStatusIndicator';
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

  // Calcular métricas baseadas nos dados reais
  const totalImplementations = data?.userCompletionRate?.reduce((acc, item) => acc + item.value, 0) || 0;
  const completedImplementations = data?.userCompletionRate?.find(item => item.name === 'Concluídas')?.value || 0;
  const inProgressImplementations = data?.userCompletionRate?.find(item => item.name === 'Em andamento')?.value || 0;
  const completionRate = totalImplementations > 0 ? Math.round((completedImplementations / totalImplementations) * 100) : 0;
  
  const metrics = [
    {
      title: "Total de Implementações",
      value: totalImplementations,
      icon: PlayCircle,
      color: "text-blue-500",
      trend: null
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: CheckCircle,
      color: "text-green-500",
      trend: null
    },
    {
      title: "Em Andamento",
      value: inProgressImplementations,
      icon: Clock,
      color: "text-yellow-500",
      trend: null
    },
    {
      title: "Usuários Implementando",
      value: data?.usersByTime?.length || 0,
      icon: Users,
      color: "text-purple-500",
      trend: null
    }
  ];

  return (
    <AnalyticsTabContainer>
      {/* Metric Cards */}
      <AnalyticsMetricsGrid columns={3}>
        {metrics.map((metric, index) => (
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
              <p className="text-xs text-muted-foreground mt-1">
                Dados atualizados automaticamente
              </p>
            </CardContent>
          </Card>
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
