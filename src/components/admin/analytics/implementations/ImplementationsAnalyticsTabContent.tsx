
import React from 'react';
import { CompletionRateChart } from '../CompletionRateChart';
import { WeeklyActivityChart } from '../WeeklyActivityChart';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { EnhancedMetricCard } from '../components/EnhancedMetricCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Target, Zap, BarChart3 } from 'lucide-react';

interface ImplementationsAnalyticsTabContentProps {
  timeRange: string;
}

export const ImplementationsAnalyticsTabContent = ({ timeRange }: ImplementationsAnalyticsTabContentProps) => {
  const { data, loading, error } = useAnalyticsData({
    timeRange,
    category: 'all',
    difficulty: 'all'
  });

  const renderSkeleton = () => (
    <div className="space-y-6">
      <MetricsGrid>
        {Array(8).fill(0).map((_, i) => (
          <EnhancedMetricCard
            key={i}
            title="Carregando..."
            value={0}
            loading={true}
          />
        ))}
      </MetricsGrid>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[350px] bg-muted animate-pulse rounded-lg" />
        <div className="h-[350px] bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Dados de sparkline simulados
  const generateSparklineData = (baseValue: number, trend: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.max(0, baseValue + Math.random() * trend * (i + 1) / 7),
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  // Cálculo de métricas
  const completionData = data?.userCompletionRate || [];
  const totalCompleted = completionData.find(item => item.name === 'Concluídas')?.value || 0;
  const totalInProgress = completionData.find(item => item.name === 'Em andamento')?.value || 0;
  const totalImplementations = totalCompleted + totalInProgress;
  const completionRate = totalImplementations > 0 ? Math.round((totalCompleted / totalImplementations) * 100) : 0;
  
  // Métricas adicionais simuladas
  const avgCompletionTime = 16; // dias
  const engagementScore = 78; // %
  const successRate = 85; // %
  const abandonmentRate = 15; // %
  const weeklyGrowth = 12; // %

  const enhancedMetrics = [
    {
      title: "Implementações Concluídas",
      value: totalCompleted.toLocaleString(),
      icon: <CheckCircle className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 18,
        label: "concluídas esta semana"
      },
      sparklineData: generateSparklineData(totalCompleted, 25)
    },
    {
      title: "Em Andamento",
      value: totalInProgress.toLocaleString(),
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'high' as const,
      trend: {
        value: weeklyGrowth,
        label: "novas implementações"
      },
      sparklineData: generateSparklineData(totalInProgress, 15)
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 5,
        label: "melhoria contínua"
      }
    },
    {
      title: "Usuários Ativos",
      value: totalImplementations.toLocaleString(),
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'medium' as const,
      trend: {
        value: 8,
        label: "implementando ativamente"
      },
      sparklineData: generateSparklineData(totalImplementations, 30)
    },
    {
      title: "Tempo Médio",
      value: `${avgCompletionTime} dias`,
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'medium' as const,
      trend: {
        value: -3,
        label: "otimização de tempo"
      }
    },
    {
      title: "Score de Engajamento",
      value: `${engagementScore}%`,
      icon: <Zap className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'medium' as const,
      trend: {
        value: 7,
        label: "usuários engajados"
      }
    },
    {
      title: "Taxa de Sucesso",
      value: `${successRate}%`,
      icon: <BarChart3 className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'low' as const,
      trend: {
        value: 4,
        label: "implementações bem-sucedidas"
      }
    },
    {
      title: "Taxa de Abandono",
      value: `${abandonmentRate}%`,
      icon: <AlertTriangle className="h-5 w-5" />,
      colorScheme: 'pink' as const,
      priority: 'low' as const,
      trend: {
        value: -2,
        label: "redução do abandono"
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Metric Cards */}
      <MetricsGrid columns={4} gap="md">
        {enhancedMetrics.map((metric, index) => (
          <EnhancedMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            colorScheme={metric.colorScheme}
            priority={metric.priority}
            trend={metric.trend}
            sparklineData={metric.sparklineData}
          />
        ))}
      </MetricsGrid>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedPieChart
          data={completionData}
          title="Status das Implementações"
          description="Distribuição de implementações por status atual"
          category="value"
          index="name"
          colors={['#10B981', '#F59E0B', '#EF4444']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          showLegend={true}
          innerRadius={80}
          outerRadius={140}
        />
        
        <EnhancedBarChart
          data={data?.dayOfWeekActivity || []}
          title="Atividade por Dia da Semana"
          description="Padrão de atividade de implementações"
          categories={['atividade']}
          index="day"
          colors={['#0ABAB5']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          size="medium"
          layout="horizontal"
        />
      </div>
      
      {/* Implementation Progress Over Time */}
      <EnhancedAreaChart
        data={data?.implementationProgressOverTime || [
          { week: 'Sem 1', concluidas: 8, em_andamento: 15, novas: 12 },
          { week: 'Sem 2', concluidas: 12, em_andamento: 18, novas: 14 },
          { week: 'Sem 3', concluidas: 15, em_andamento: 22, novas: 16 },
          { week: 'Sem 4', concluidas: 18, em_andamento: 25, novas: 18 }
        ]}
        title="Progresso das Implementações ao Longo do Tempo"
        description="Evolução semanal do status das implementações"
        categories={['concluidas', 'em_andamento', 'novas']}
        index="week"
        colors={['#10B981', '#F59E0B', '#3B82F6']}
        valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
        size="large"
        curved={true}
        showLegend={true}
      />
    </div>
  );
};
