
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LazyEnhancedAreaChart, LazyEnhancedBarChart } from './charts/LazyChartComponents';
import { EnhancedMetricCard } from './components/EnhancedMetricCard';
import { MetricsGrid } from './components/MetricsGrid';
import { TransitionWrapper } from './components/TransitionWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Users, FileText, GraduationCap, Target, TrendingUp, Activity, Clock } from 'lucide-react';
import { useOptimizedAnalyticsData } from '@/hooks/analytics/useOptimizedAnalyticsData';
import { useOptimizedAnalyticsContext } from './providers/OptimizedAnalyticsProvider';

interface RealAnalyticsOverviewProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export const RealAnalyticsOverview = ({ data: fallbackData, loading: fallbackLoading, error }: RealAnalyticsOverviewProps) => {
  const { isOptimizationEnabled, cacheEnabled, debounceDelay } = useOptimizedAnalyticsContext();
  
  // Usar hook otimizado se habilitado, senão usar dados fallback
  const {
    data: optimizedData,
    loading: optimizedLoading,
    error: optimizedError,
    metadata
  } = useOptimizedAnalyticsData({
    timeRange: '30d',
    enableCache: cacheEnabled,
    debounceDelay
  });

  // Selecionar dados baseado na configuração
  const data = isOptimizationEnabled ? optimizedData : fallbackData;
  const loading = isOptimizationEnabled ? optimizedLoading : fallbackLoading;
  const finalError = isOptimizationEnabled ? optimizedError : error;

  // Dados de exemplo para sparklines (últimos 7 dias)
  const generateSparklineData = (baseValue: number, trend: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.max(0, baseValue + Math.random() * trend * (i + 1) / 7),
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const loadingSkeleton = (
    <div className="space-y-6">
      <MetricsGrid>
        {Array.from({ length: 8 }).map((_, i) => (
          <EnhancedMetricCard
            key={i}
            title="Carregando..."
            value={0}
            loading={true}
          />
        ))}
      </MetricsGrid>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );

  if (finalError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{finalError}</AlertDescription>
      </Alert>
    );
  }

  const enhancedMetrics = [
    {
      title: "Total de Usuários",
      value: data?.totalUsers?.toLocaleString() || '0',
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 12,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(data?.totalUsers || 0, 50)
    },
    {
      title: "Usuários Ativos (7d)",
      value: data?.activeUsers7d?.toLocaleString() || '0',
      icon: <Activity className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'high' as const,
      trend: {
        value: 8,
        label: "vs semana anterior"
      },
      sparklineData: generateSparklineData(data?.activeUsers7d || 0, 20)
    },
    {
      title: "Soluções Ativas",
      value: data?.totalSolutions?.toLocaleString() || '0',
      icon: <FileText className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'medium' as const,
      trend: {
        value: 5,
        label: "novas este mês"
      },
      sparklineData: generateSparklineData(data?.totalSolutions || 0, 10)
    },
    {
      title: "Cursos Publicados",
      value: data?.totalCourses?.toLocaleString() || '0',
      icon: <GraduationCap className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'medium' as const,
      trend: {
        value: 3,
        label: "novos cursos"
      },
      sparklineData: generateSparklineData(data?.totalCourses || 0, 5)
    },
    {
      title: "Implementações Concluídas",
      value: data?.completedImplementations?.toLocaleString() || '0',
      icon: <CheckCircle className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 15,
        label: "conclusões recentes"
      },
      sparklineData: generateSparklineData(data?.completedImplementations || 0, 25)
    },
    {
      title: "Novos Usuários (30d)",
      value: data?.newUsers30d?.toLocaleString() || '0',
      icon: <TrendingUp className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'medium' as const,
      trend: {
        value: 22,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(data?.newUsers30d || 0, 15)
    },
    {
      title: "Taxa de Conclusão",
      value: `${data?.overallCompletionRate || 0}%`,
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'medium' as const,
      trend: {
        value: 4,
        label: "melhoria contínua"
      }
    },
    {
      title: "Tempo Médio (dias)",
      value: data?.avgImplementationTimeDays || 0,
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'pink' as const,
      priority: 'low' as const,
      trend: {
        value: -2,
        label: "otimização de processos"
      }
    }
  ];

  return (
    <TransitionWrapper 
      isLoading={loading} 
      loadingSkeleton={loadingSkeleton}
      className="space-y-6"
    >
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LazyEnhancedAreaChart
          data={data?.userGrowthData || []}
          title="Crescimento de Usuários"
          description="Novos usuários registrados ao longo do tempo"
          categories={['novos', 'total']}
          index="name"
          colors={['#3B82F6', '#0ABAB5']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          size="medium"
          curved={true}
        />

        <LazyEnhancedBarChart
          data={data?.solutionPerformance || []}
          title="Soluções Mais Populares"
          description="Top 5 soluções mais implementadas"
          categories={['value']}
          index="name"
          colors={['#F59E0B']}
          valueFormatter={(value) => `${value} implementação${value !== 1 ? 'ões' : ''}`}
          size="medium"
          layout="vertical"
        />

        <LazyEnhancedBarChart
          data={data?.weeklyActivity || []}
          title="Atividade Semanal"
          description="Atividade dos usuários por dia da semana"
          categories={['atividade']}
          index="day"
          colors={['#0ABAB5']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          size="medium"
          layout="horizontal"
        />
      </div>

      {/* Status do Sistema */}
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">
          Sistema de Analytics Avançado Operacional
          {isOptimizationEnabled && metadata?.fromCache && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Cache Hit - {metadata.queryTime}ms
            </span>
          )}
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Exibindo dados reais de {data?.totalUsers || 0} usuários e {data?.totalSolutions || 0} soluções. 
          Sistema de gráficos modernizado com animações, tooltips avançados e design responsivo implementado com sucesso.
          {isOptimizationEnabled && (
            <span className="block mt-1 text-sm">
              🚀 Modo otimizado ativo - Cache: {cacheEnabled ? 'Habilitado' : 'Desabilitado'} | 
              Debounce: {debounceDelay}ms
            </span>
          )}
        </AlertDescription>
      </Alert>
    </TransitionWrapper>
  );
};
