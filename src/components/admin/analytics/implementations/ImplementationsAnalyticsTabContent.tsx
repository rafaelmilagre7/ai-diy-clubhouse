
import React from 'react';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { EnhancedMetricCard } from '../components/EnhancedMetricCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
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

  const renderSkeleton = () => (
    <div className="space-y-6">
      <MetricsGrid>
        {Array(6).fill(0).map((_, i) => (
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
        <AlertTitle>Erro ao carregar dados de implementações</AlertTitle>
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

  // Calcular métricas baseadas nos dados disponíveis
  const totalImplementations = data.implementationsByCategory?.reduce((sum, cat) => sum + cat.value, 0) || 0;
  const completedImplementations = data.userCompletionRate?.find(item => item.name === 'Concluídas')?.value || 0;
  const inProgressImplementations = data.userCompletionRate?.find(item => item.name === 'Em andamento')?.value || 0;
  const completionRate = totalImplementations > 0 
    ? Math.round((completedImplementations / (completedImplementations + inProgressImplementations)) * 100) 
    : 0;
  const avgTimeToComplete = 4.2; // Mock - em produção viria dos dados

  const enhancedMetrics = [
    {
      title: "Total de Implementações",
      value: totalImplementations.toLocaleString(),
      icon: <PlayCircle className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 18,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(totalImplementations, 15)
    },
    {
      title: "Implementações Concluídas",
      value: completedImplementations.toLocaleString(),
      icon: <CheckCircle className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 12,
        label: "finalizações por semana"
      },
      sparklineData: generateSparklineData(completedImplementations, 8)
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'high' as const,
      trend: {
        value: 6,
        label: "melhoria contínua"
      }
    },
    {
      title: "Em Andamento",
      value: inProgressImplementations.toLocaleString(),
      icon: <Activity className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'medium' as const,
      trend: {
        value: 22,
        label: "novas implementações"
      },
      sparklineData: generateSparklineData(inProgressImplementations, 12)
    },
    {
      title: "Tempo Médio Conclusão",
      value: `${avgTimeToComplete} dias`,
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'medium' as const,
      trend: {
        value: -15,
        label: "otimização de processo"
      }
    },
    {
      title: "Usuários Ativos",
      value: "156",
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'low' as const,
      trend: {
        value: 9,
        label: "engajamento alto"
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Metric Cards */}
      <MetricsGrid columns={3} gap="md">
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
          data={data.userCompletionRate || []}
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
          data={data.implementationsByCategory || []}
          title="Implementações por Categoria"
          description="Distribuição das implementações por área de negócio"
          categories={['value']}
          index="name"
          colors={['#3B82F6']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          layout="horizontal"
        />
      </div>
      
      {/* Activity by Day Chart */}
      <EnhancedAreaChart
        data={data.dayOfWeekActivity || []}
        title="Atividade de Implementação por Dia"
        description="Padrão de atividade das implementações ao longo da semana"
        categories={['atividade']}
        index="day"
        colors={['#8B5CF6']}
        valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
        size="large"
        curved={true}
      />
    </div>
  );
};
