
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Users, FileText, GraduationCap, CheckCircle, 
         Activity, MessageSquare, MousePointer, TrendingUp, Clock } from 'lucide-react';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { PieChart, BarChart } from '@/components/ui/chart';

interface RealAnalyticsOverviewProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export const RealAnalyticsOverview = ({ data, loading, error }: RealAnalyticsOverviewProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const metricCards = [
    {
      title: 'Total de Usuários', 
      value: data.totalUsers,
      icon: <Users className="h-5 w-5" />,
      change: data.newUsers30d,
      changeText: 'novos em 30 dias',
      color: 'bg-blue-500'
    },
    {
      title: 'Usuários Ativos', 
      value: data.activeUsers7d,
      icon: <Activity className="h-5 w-5" />,
      change: Math.round((data.activeUsers7d / data.totalUsers) * 100),
      changeText: '% do total',
      color: 'bg-green-500'
    },
    {
      title: 'Soluções Publicadas', 
      value: data.totalSolutions,
      icon: <FileText className="h-5 w-5" />,
      change: data.newImplementations30d,
      changeText: 'implementações/mês',
      color: 'bg-purple-500'
    },
    {
      title: 'Cursos Ativos', 
      value: data.totalCourses,
      icon: <GraduationCap className="h-5 w-5" />,
      change: data.activeLearners7d,
      changeText: 'alunos ativos',
      color: 'bg-orange-500'
    },
    {
      title: 'Implementações Completas', 
      value: data.completedImplementations,
      icon: <CheckCircle className="h-5 w-5" />,
      change: data.overallCompletionRate,
      changeText: '% taxa conclusão',
      color: 'bg-emerald-500'
    },
    {
      title: 'Tempo Médio Implementação', 
      value: `${data.avgImplementationTimeDays} dias`,
      icon: <Clock className="h-5 w-5" />,
      change: data.activeImplementations,
      changeText: 'em andamento',
      color: 'bg-blue-500'
    },
    {
      title: 'Tópicos no Fórum', 
      value: data.forumTopics,
      icon: <MessageSquare className="h-5 w-5" />,
      change: null,
      changeText: 'discussões ativas',
      color: 'bg-pink-500'
    },
    {
      title: 'Cliques em Benefícios', 
      value: data.totalBenefitClicks,
      icon: <MousePointer className="h-5 w-5" />,
      change: null,
      changeText: 'engajamento total',
      color: 'bg-cyan-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${metric.color} bg-opacity-10`}>
                <div className={`${metric.color.replace('bg-', 'text-')}`}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              {metric.change !== null && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{metric.change} {metric.changeText}</span>
                </div>
              )}
              {metric.change === null && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.changeText}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de usuários */}
        <UserGrowthChart data={data.userGrowthData} />
        
        {/* Soluções populares */}
        <PopularSolutionsChart data={data.solutionPerformance} />
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade semanal */}
        <WeeklyActivityChart data={data.weeklyActivity} />
        
        {/* Distribuição de roles */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-white">
              Distribuição de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.userRoleDistribution.length > 0 ? (
              <PieChart 
                data={data.userRoleDistribution}
                category="count"
                index="role"
                valueFormatter={(value) => `${value} usuários`}
                colors={['#0ABAB5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
                className="h-[200px]"
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-neutral-500">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Progresso de aprendizado */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-white">
              Progresso de Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.learningProgress.length > 0 ? (
              <BarChart 
                data={data.learningProgress}
                categories={['enrolled']}
                index="courseName"
                colors={['#10B981']}
                valueFormatter={(value) => `${value} alunos`}
                className="h-[200px]"
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-neutral-500">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
