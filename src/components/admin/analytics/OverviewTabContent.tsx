
import React from 'react';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { CompletionRateChart } from './CompletionRateChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataStatusIndicator } from './DataStatusIndicator';
import { useUnifiedAnalytics } from '@/hooks/admin/useUnifiedAnalytics';

interface OverviewTabContentProps {
  timeRange: string;
}

export const OverviewTabContent = ({ timeRange }: OverviewTabContentProps) => {
  const { data, loading, error, lastUpdate, refetch, hasData, isStale } = useUnifiedAnalytics(timeRange);

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <DataStatusIndicator loading={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading && !data) {
    return renderSkeleton();
  }

  const renderDataStatus = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Visão Geral - Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Dados em tempo real do sistema para o período: {timeRange}
          {lastUpdate && (
            <span className="ml-2 text-xs">
              <Clock className="h-3 w-3 inline mr-1" />
              Atualizado: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isStale && (
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        )}
        <DataStatusIndicator 
          isDataReal={hasData && !error} 
          loading={loading}
          error={error}
          isEmpty={!hasData}
        />
      </div>
    </div>
  );

  if (error && !data) {
    return (
      <div className="space-y-6">
        {renderDataStatus()}
        <Alert className="mb-6 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-neutral-800 dark:text-white">Erro ao carregar dados</AlertTitle>
          <AlertDescription className="text-neutral-700 dark:text-neutral-300 space-y-4">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasData && !loading) {
    return (
      <div className="space-y-6">
        {renderDataStatus()}
        <Alert className="mb-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-neutral-800 dark:text-white">Sem dados disponíveis</AlertTitle>
          <AlertDescription className="text-neutral-700 dark:text-neutral-300 space-y-4">
            <p>
              Não foram encontrados dados de análise para o período selecionado. 
              Tente selecionar um período diferente ou verificar se existem registros no sistema.
            </p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar dados
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Extrair dados para os gráficos a partir da RPC unificada
  const chartData = data ? {
    usersByTime: [], // Este seria preenchido por outra RPC se necessário
    solutionPopularity: [], // Este seria preenchido por outra RPC se necessário  
    implementationsByCategory: [], // Este seria preenchido por outra RPC se necessário
    userCompletionRate: data.completion_rate_data || [],
    dayOfWeekActivity: data.engagement_data || []
  } : {
    usersByTime: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: []
  };

  return (
    <div className="space-y-6">
      {renderDataStatus()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserGrowthChart data={chartData.usersByTime} />
        <PopularSolutionsChart data={chartData.solutionPopularity} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImplementationsByCategoryChart data={chartData.implementationsByCategory} />
        <CompletionRateChart data={chartData.userCompletionRate} />
        <WeeklyActivityChart data={chartData.dayOfWeekActivity} />
      </div>
    </div>
  );
};
