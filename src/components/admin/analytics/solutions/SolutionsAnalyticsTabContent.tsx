
import React from 'react';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { EnhancedMetricCard } from '../components/EnhancedMetricCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
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
        <AlertTitle>Erro ao carregar dados de soluções</AlertTitle>
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
  const totalSolutions = data.solutionPopularity?.length || 0;
  const totalImplementations = data.implementationsByCategory?.reduce((sum, cat) => sum + cat.value, 0) || 0;
  const avgCompletionRate = data.userCompletionRate?.length > 0 
    ? Math.round((data.userCompletionRate.find(item => item.name === 'Concluídas')?.value || 0) / 
                 data.userCompletionRate.reduce((sum, item) => sum + item.value, 0) * 100) || 0
    : 75; // Mock value

  const enhancedMetrics = [
    {
      title: "Total de Soluções",
      value: totalSolutions.toLocaleString(),
      icon: <FileText className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 8,
        label: "novas este mês"
      },
      sparklineData: generateSparklineData(totalSolutions, 3)
    },
    {
      title: "Implementações Ativas",
      value: totalImplementations.toLocaleString(),
      icon: <BarChart3 className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 15,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(totalImplementations, 10)
    },
    {
      title: "Taxa de Conclusão",
      value: `${avgCompletionRate}%`,
      icon: <CheckCircle className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'medium' as const,
      trend: {
        value: 5,
        label: "melhoria contínua"
      }
    },
    {
      title: "Popularidade Média",
      value: data.solutionPopularity?.length > 0 
        ? Math.round(data.solutionPopularity.reduce((sum, sol) => sum + sol.value, 0) / data.solutionPopularity.length).toLocaleString()
        : '0',
      icon: <TrendingUp className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'medium' as const,
      trend: {
        value: 12,
        label: "engajamento alto"
      }
    },
    {
      title: "Tempo Médio Implementação",
      value: "2.3 dias",
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'medium' as const,
      trend: {
        value: -8,
        label: "otimização contínua"
      }
    },
    {
      title: "Usuários Únicos",
      value: "1.2k",
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'low' as const,
      trend: {
        value: 18,
        label: "alcance crescente"
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
        <EnhancedBarChart
          data={data.solutionPopularity || []}
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
          data={data.implementationsByCategory || []}
          title="Distribuição por Categoria"
          description="Implementações organizadas por área de negócio"
          category="value"
          index="name"
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          showLegend={true}
        />
      </div>
      
      {/* User Progress Chart */}
      <EnhancedAreaChart
        data={data.userCompletionRate || []}
        title="Progresso de Implementações"
        description="Status de conclusão das implementações dos usuários"
        categories={['value']}
        index="name"
        colors={['#10B981']}
        valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
        size="large"
        curved={true}
      />
    </div>
  );
};
