
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, CheckCircle, BarChart3, Target, AlertCircle } from 'lucide-react';
import { BarChart, PieChart } from '@/components/ui/chart';
import { useSolutionAnalyticsData } from '@/hooks/analytics/useSolutionAnalyticsData';

interface SolutionAnalyticsTabContentProps {
  timeRange: string;
}

export const SolutionAnalyticsTabContent = ({ timeRange }: SolutionAnalyticsTabContentProps) => {
  const { data, loading, error } = useSolutionAnalyticsData(timeRange);

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
        <AlertTitle>Erro ao carregar dados de soluções</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const solutionStatsCards = [
    {
      title: "Total de Soluções",
      value: data.totalSolutions.toLocaleString(),
      icon: FileText,
      color: "text-operational",
      bgColor: "bg-operational/10 dark:bg-operational/20"
    },
    {
      title: "Soluções Publicadas",
      value: data.publishedSolutions.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Total de Implementações",
      value: data.totalImplementations.toLocaleString(),
      icon: BarChart3,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Taxa Média de Conclusão",
      value: `${data.averageCompletionRate}%`,
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas de Soluções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {solutionStatsCards.map((stat, index) => {
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
                  Dados consolidados da plataforma
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos de Distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Implementações por Categoria</CardTitle>
            <CardDescription>
              Distribuição das implementações por categoria de solução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.solutionsByCategory.length > 0 ? (
                <PieChart
                  data={data.solutionsByCategory}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} implementações`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de categoria disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Dificuldade */}
        <Card>
          <CardHeader>
            <CardTitle>Soluções por Dificuldade</CardTitle>
            <CardDescription>
              Distribuição das soluções por nível de dificuldade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.solutionsByDifficulty.length > 0 ? (
                <BarChart
                  data={data.solutionsByDifficulty}
                  index="name"
                  categories={["value"]}
                  colors={["hsl(var(--warning))"]}
                  valueFormatter={(value) => `${value} soluções`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de dificuldade disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Soluções */}
      <Card>
        <CardHeader>
          <CardTitle>Top Soluções Mais Implementadas</CardTitle>
          <CardDescription>
            Soluções com maior número de implementações na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topSolutions.length > 0 ? (
              data.topSolutions.map((solution, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{solution.title}</h4>
                    <p className="text-sm text-muted-foreground">{solution.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{solution.implementations} implementações</div>
                    <div className="text-sm text-muted-foreground">
                      {solution.completionRate}% de conclusão
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma solução encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
