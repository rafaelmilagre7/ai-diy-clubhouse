
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { CompletionRateChart } from './CompletionRateChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Users, BookOpen, Target, Activity } from 'lucide-react';

interface RealAnalyticsOverviewProps {
  data?: {
    totalUsers: number;
    totalSolutions: number;
    totalCourses: number;
    activeImplementations: number;
    usersByTime: any[];
    solutionPopularity: any[];
    implementationsByCategory: any[];
    userCompletionRate: any[];
    dayOfWeekActivity: any[];
  };
  loading?: boolean;
  error?: Error | null;
}

export const RealAnalyticsOverview = ({ 
  data, 
  loading = false, 
  error = null 
}: RealAnalyticsOverviewProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados de analytics. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert className="bg-muted/10 border-muted/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sem dados disponíveis</AlertTitle>
        <AlertDescription>
          Não há dados disponíveis para exibir no momento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Usuários
                </p>
                <p className="text-3xl font-bold text-card-foreground">
                  {data.totalUsers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Soluções
                </p>
                <p className="text-3xl font-bold text-card-foreground">
                  {data.totalSolutions?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cursos Ativos
                </p>
                <p className="text-3xl font-bold text-card-foreground">
                  {data.totalCourses?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Implementações Ativas
                </p>
                <p className="text-3xl font-bold text-card-foreground">
                  {data.activeImplementations?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={data.usersByTime || []} />
        <PopularSolutionsChart data={data.solutionPopularity || []} />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ImplementationsByCategoryChart data={data.implementationsByCategory || []} />
        <CompletionRateChart data={data.userCompletionRate || []} />
        <WeeklyActivityChart data={data.dayOfWeekActivity || []} />
      </div>
    </div>
  );
};
