import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GraduationCap, BookOpen, Users, TrendingUp, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { useRealLmsAnalytics } from '@/hooks/analytics/lms/useRealLmsAnalytics';
import { CoursePerformanceTable } from './CoursePerformanceTable';
import { ProgressDistributionChart } from './ProgressDistributionChart';
import { AnalyticsTabContainer, AnalyticsMetricsGrid } from '../components/AnalyticsTabContainer';

interface RealLmsAnalyticsTabProps {
  timeRange: string;
}

export const RealLmsAnalyticsTab = ({ timeRange }: RealLmsAnalyticsTabProps) => {
  const { data, isLoading, error } = useRealLmsAnalytics(timeRange);

  if (isLoading) {
    return (
      <AnalyticsTabContainer>
        <AnalyticsMetricsGrid columns={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </AnalyticsMetricsGrid>
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </AnalyticsTabContainer>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar analytics de cursos</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sem dados disponíveis</AlertTitle>
        <AlertDescription>
          Nenhum dado de analytics foi encontrado para o período selecionado.
        </AlertDescription>
      </Alert>
    );
  }

  const kpiCards = [
    {
      title: "Total de Cursos",
      value: data.totalCourses.toLocaleString(),
      icon: GraduationCap,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "Cursos publicados"
    },
    {
      title: "Total de Aulas",
      value: data.totalLessons.toLocaleString(),
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Aulas disponíveis"
    },
    {
      title: "Cursos Iniciados",
      value: data.coursesStarted.toLocaleString(),
      icon: PlayCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      description: "No período selecionado"
    },
    {
      title: "Cursos Concluídos",
      value: data.coursesCompleted.toLocaleString(),
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      description: "No período selecionado"
    },
    {
      title: "Progresso Médio",
      value: `${data.averageProgress}%`,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      description: "Todos os cursos"
    },
    {
      title: "Matrículas Ativas",
      value: data.activeEnrollments.toLocaleString(),
      icon: Users,
      color: "text-aurora-primary",
      bgColor: "bg-aurora-primary/10 dark:bg-aurora-primary/20",
      description: "Com atividade recente"
    }
  ];

  return (
    <AnalyticsTabContainer>
      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico de Distribuição de Progresso */}
      <ProgressDistributionChart 
        data={data.progressDistribution} 
        isLoading={isLoading}
      />

      {/* Tabela de Performance por Curso */}
      <CoursePerformanceTable 
        data={data.courseStats} 
        isLoading={isLoading}
      />
    </AnalyticsTabContainer>
  );
};
