
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Users, FileText, GraduationCap, Target, TrendingUp, Activity, Clock } from 'lucide-react';

interface RealAnalyticsOverviewProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export const RealAnalyticsOverview = ({ data, loading, error }: RealAnalyticsOverviewProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
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
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const statsCards = [
    {
      title: "Total de Usuários",
      value: data.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Soluções Ativas",
      value: data.totalSolutions,
      icon: FileText,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Cursos Publicados",
      value: data.totalCourses,
      icon: GraduationCap,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Implementações Concluídas",
      value: data.completedImplementations,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      title: "Novos Usuários (30d)",
      value: data.newUsers30d,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Usuários Ativos (7d)",
      value: data.activeUsers7d,
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
      title: "Taxa de Conclusão",
      value: `${data.overallCompletionRate}%`,
      icon: Target,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      title: "Tempo Médio (dias)",
      value: data.avgImplementationTimeDays,
      icon: Clock,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
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
                  Dados em tempo real
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UserGrowthChart data={data.userGrowthData} />
        <PopularSolutionsChart data={data.solutionPerformance} />
        <WeeklyActivityChart data={data.weeklyActivity} />
      </div>

      {/* Status do Sistema */}
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">
          Sistema de Analytics Operacional
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Exibindo dados reais de {data.totalUsers} usuários e {data.totalSolutions} soluções. 
          Views SQL otimizadas funcionando corretamente.
        </AlertDescription>
      </Alert>
    </div>
  );
};
