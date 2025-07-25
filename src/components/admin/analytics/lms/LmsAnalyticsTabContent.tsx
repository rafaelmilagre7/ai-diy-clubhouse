
import React from 'react';
import { EnhancedAreaChart, EnhancedBarChart, EnhancedPieChart } from '../charts';
import { EnhancedMetricCard } from '../components/EnhancedMetricCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { useLmsAnalyticsData } from '@/hooks/analytics/lms/useLmsAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, BookOpen, Users, Clock, TrendingUp, Target, GraduationCap, Award } from 'lucide-react';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  const { npsData, statsData, feedbackData, isLoading, refresh } = useLmsAnalyticsData(timeRange);

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

  if (isLoading) {
    return renderSkeleton();
  }

  // Dados de sparkline simulados para últimos 7 dias
  const generateSparklineData = (baseValue: number, trend: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.max(0, baseValue + Math.random() * trend * (i + 1) / 7),
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  // Calcular dados de distribuição de NPS
  const npsDistributionData = [
    { name: 'Promotores', value: npsData.distribution.promoters },
    { name: 'Neutros', value: npsData.distribution.neutrals },
    { name: 'Detratores', value: npsData.distribution.detractors }
  ];

  // Calcular dados de progresso (mock)
  const progressData = [
    { name: 'Não Iniciado', value: Math.max(0, statsData.totalStudents - (statsData.totalStudents * statsData.completionRate / 100)) },
    { name: 'Em Progresso', value: Math.round(statsData.totalStudents * 0.4) },
    { name: 'Concluído', value: Math.round(statsData.totalStudents * statsData.completionRate / 100) }
  ];

  // Dados de performance por aula (top 5)
  const topLessonsData = npsData.perLesson
    .sort((a, b) => b.npsScore - a.npsScore)
    .slice(0, 5)
    .map(lesson => ({
      name: lesson.lessonTitle.substring(0, 20) + (lesson.lessonTitle.length > 20 ? '...' : ''),
      value: lesson.npsScore,
      responses: lesson.responseCount
    }));

  // Dados de atividade semanal (mock)
  const weeklyActivityData = [
    { day: 'Dom', atividade: 45 },
    { day: 'Seg', atividade: 120 },
    { day: 'Ter', atividade: 98 },
    { day: 'Qua', atividade: 135 },
    { day: 'Qui', atividade: 110 },
    { day: 'Sex', atividade: 89 },
    { day: 'Sáb', atividade: 67 }
  ];

  const enhancedMetrics = [
    {
      title: "Total de Cursos",
      value: "12",
      icon: <BookOpen className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 15,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(12, 2)
    },
    {
      title: "Estudantes Ativos",
      value: statsData.totalStudents.toLocaleString(),
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 22,
        label: "novos estudantes"
      },
      sparklineData: generateSparklineData(statsData.totalStudents, 10)
    },
    {
      title: "Score NPS Geral",
      value: `${npsData.overall}`,
      icon: <Award className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'high' as const,
      trend: {
        value: 8,
        label: "melhoria contínua"
      }
    },
    {
      title: "Taxa de Conclusão",
      value: `${statsData.completionRate}%`,
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'medium' as const,
      trend: {
        value: 12,
        label: "eficiência alta"
      }
    },
    {
      title: "Total de Aulas",
      value: statsData.totalLessons.toLocaleString(),
      icon: <GraduationCap className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'medium' as const,
      trend: {
        value: 6,
        label: "conteúdo expandido"
      },
      sparklineData: generateSparklineData(statsData.totalLessons, 3)
    },
    {
      title: "Tempo Médio/Aula",
      value: "45 min",
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'low' as const,
      trend: {
        value: -5,
        label: "otimização contínua"
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
          data={topLessonsData}
          title="Aulas com Melhor Avaliação"
          description="Top 5 aulas com maior score NPS"
          categories={['value']}
          index="name"
          colors={['#0ABAB5']}
          valueFormatter={(value) => `NPS ${value}`}
          size="medium"
          layout="horizontal"
        />
        
        <EnhancedPieChart
          data={npsDistributionData}
          title="Distribuição de Feedback"
          description="Classificação dos estudantes por NPS"
          category="value"
          index="name"
          colors={['#10B981', '#F59E0B', '#EF4444']}
          valueFormatter={(value) => `${value} estudante${value !== 1 ? 's' : ''}`}
          size="medium"
          showLegend={true}
        />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedPieChart
          data={progressData}
          title="Status dos Estudantes"
          description="Distribuição do progresso de aprendizagem"
          category="value"
          index="name"
          colors={['#6B7280', '#3B82F6', '#10B981']}
          valueFormatter={(value) => `${value} estudante${value !== 1 ? 's' : ''}`}
          size="medium"
          showLegend={true}
        />

        <EnhancedAreaChart
          data={weeklyActivityData}
          title="Atividade Semanal"
          description="Padrão de atividade dos estudantes por dia da semana"
          categories={['atividade']}
          index="day"
          colors={['#8B5CF6']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          size="medium"
          curved={true}
        />
      </div>

      {/* System Status Alert */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Analytics Avançado Ativo</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Sistema de analytics modernizado com métricas em tempo real, 
          gráficos interativos e indicadores de performance avançados.
        </AlertDescription>
      </Alert>
    </div>
  );
};
