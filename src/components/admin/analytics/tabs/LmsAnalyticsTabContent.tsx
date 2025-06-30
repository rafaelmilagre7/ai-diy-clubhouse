
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GraduationCap, BookOpen, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, PieChart } from '@/components/ui/chart';
import { useLmsAnalyticsData } from '@/hooks/analytics/useLmsAnalyticsData';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  const { data, loading, error } = useLmsAnalyticsData(timeRange);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados de aprendizado</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const lmsStatsCards = [
    {
      title: "Total de Cursos",
      value: data.totalCourses,
      icon: GraduationCap,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Total de Aulas",
      value: data.totalLessons,
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Matrículas Ativas",
      value: data.totalEnrollments,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Progresso Médio",
      value: `${data.averageProgress}%`,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas LMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lmsStatsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-md flex items-center justify-center ${stat.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sistema de aprendizado
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos LMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance dos Cursos */}
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Cursos</CardTitle>
            <CardDescription>
              Progresso médio e matrículas por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.coursePerformance.length > 0 ? (
                <BarChart
                  data={data.coursePerformance}
                  index="courseName"
                  categories={["avgProgress"]}
                  colors={["#0ABAB5"]}
                  valueFormatter={(value) => `${value}%`}
                  layout="vertical"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de cursos disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Progresso */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Progresso</CardTitle>
            <CardDescription>
              Alunos agrupados por faixa de progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.progressDistribution.length > 0 ? (
                <PieChart
                  data={data.progressDistribution}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} alunos`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de progresso disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Performance Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Curso</CardTitle>
          <CardDescription>
            Métricas detalhadas de cada curso da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.coursePerformance.length > 0 ? (
              data.coursePerformance.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{course.courseName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.enrolled} alunos matriculados
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{course.avgProgress}% progresso</div>
                    <div className="text-sm text-muted-foreground">
                      {course.completions} conclusões estimadas
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum curso encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
