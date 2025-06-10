
import React from 'react';
import { CompletionRateChart } from '../CompletionRateChart';
import { WeeklyActivityChart } from '../WeeklyActivityChart';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface ImplementationsAnalyticsTabContentProps {
  timeRange: string;
}

export const ImplementationsAnalyticsTabContent = ({ timeRange }: ImplementationsAnalyticsTabContentProps) => {
  const { data, loading, error } = useAnalyticsData({
    timeRange,
    category: 'all',
    difficulty: 'all'
  });

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="h-8 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
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

  const completionData = data?.userCompletionRate || [];
  const totalCompleted = completionData.find(item => item.name === 'Concluídas')?.value || 0;
  const totalInProgress = completionData.find(item => item.name === 'Em andamento')?.value || 0;
  const totalImplementations = totalCompleted + totalInProgress;
  const completionRate = totalImplementations > 0 ? Math.round((totalCompleted / totalImplementations) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implementações Concluídas</p>
                <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-foreground">{totalInProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateChart data={completionData} />
        <WeeklyActivityChart data={data?.dayOfWeekActivity || []} />
      </div>
    </div>
  );
};
