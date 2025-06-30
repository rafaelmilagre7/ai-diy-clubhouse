
import React from 'react';
import { SolutionPopularityChart } from './SolutionPopularityChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { EnhancedBarChart, EnhancedPieChart, EnhancedAreaChart } from '../charts';
import { EnhancedMetricCard } from '../components/EnhancedMetricCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Package, TrendingUp, Target, Eye, Star, BookOpen, Users } from 'lucide-react';

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
  const totalSolutions = data?.solutionPopularity?.length || 0;
  const totalImplementations = data?.implementationsByCategory?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
  const avgImplementationsPerSolution = totalSolutions > 0 ? Math.round(totalImplementations / totalSolutions) : 0;
  const totalViews = 1240; // Mock - em produção viria dos dados
  const avgRating = 4.7; // Mock - em produção viria dos dados
  const publishedSolutions = Math.round(totalSolutions * 0.85); // Mock
  const engagementRate = 68; // Mock

  const enhancedMetrics = [
    {
      title: "Total de Soluções",
      value: totalSolutions.toLocaleString(),
      icon: <Package className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 8,
        label: "novas este mês"
      },
      sparklineData: generateSparklineData(totalSolutions, 10)
    },
    {
      title: "Implementações Totais",
      value: totalImplementations.toLocaleString(),
      icon: <TrendingUp className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 22,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(totalImplementations, 50)
    },
    {
      title: "Média por Solução",
      value: avgImplementationsPerSolution.toLocaleString(),
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'medium' as const,
      trend: {
        value: 12,
        label: "implementações"
      }
    },
    {
      title: "Total de Visualizações",
      value: totalViews.toLocaleString(),
      icon: <Eye className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'medium' as const,
      trend: {
        value: 18,
        label: "visualizações este mês"
      },
      sparklineData: generateSparklineData(totalViews, 200)
    },
    {
      title: "Avaliação Média",
      value: avgRating.toFixed(1),
      icon: <Star className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'medium' as const,
      trend: {
        value: 2,
        label: "melhoria contínua"
      }
    },
    {
      title: "Soluções Publicadas",
      value: publishedSolutions.toLocaleString(),
      icon: <BookOpen className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'medium' as const,
      trend: {
        value: 95,
        label: "% de aprovação"
      }
    },
    {
      title: "Taxa de Engajamento",
      value: `${engagementRate}%`,
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'pink' as const,
      priority: 'low' as const,
      trend: {
        value: 7,
        label: "usuários engajados"
      }
    },
    {
      title: "Soluções Favoritas",
      value: "156",
      icon: <Star className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'low' as const,
      trend: {
        value: 23,
        label: "favoritadas este mês"
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
        <EnhancedBarChart
          data={data?.solutionPopularity || []}
          title="Soluções Mais Populares"
          description="Top 10 soluções com maior número de implementações"
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
          description="Implementações agrupadas por categoria de solução"
          category="value"
          index="name"
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          showLegend={true}
        />
      </div>
      
      {/* Solution Performance Over Time */}
      <EnhancedAreaChart
        data={data?.solutionPerformanceOverTime || [
          { month: 'Jan', views: 200, implementations: 45 },
          { month: 'Fev', views: 280, implementations: 52 },
          { month: 'Mar', views: 350, implementations: 68 },
          { month: 'Abr', views: 420, implementations: 75 },
          { month: 'Mai', views: 480, implementations: 89 },
          { month: 'Jun', views: 560, implementations: 98 }
        ]}
        title="Performance das Soluções ao Longo do Tempo"
        description="Evolução de visualizações e implementações mensais"
        categories={['views', 'implementations']}
        index="month"
        colors={['#3B82F6', '#0ABAB5']}
        valueFormatter={(value) => value.toLocaleString()}
        size="large"
        curved={true}
        showLegend={true}
      />
    </div>
  );
};
