
import React from 'react';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { CompletionRateChart } from './CompletionRateChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverviewTabContentProps {
  timeRange: string;
  loading?: boolean;
  data?: {
    usersByTime: any[];
    solutionPopularity: any[];
    implementationsByCategory: any[];
    userCompletionRate: any[];
    dayOfWeekActivity: any[];
  };
  onRefresh?: () => void;
}

export const OverviewTabContent = ({ 
  timeRange, 
  loading = true, 
  data = {
    usersByTime: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: []
  },
  onRefresh
}: OverviewTabContentProps) => {
  const renderSkeleton = () => (
    <div className="space-y-6">
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

  const hasData = !loading && (
    data?.usersByTime.length > 0 || 
    data?.solutionPopularity.length > 0 || 
    data?.implementationsByCategory.length > 0 || 
    data?.userCompletionRate.length > 0 || 
    data?.dayOfWeekActivity.length > 0
  );

  if (loading) {
    return renderSkeleton();
  }

  if (!hasData) {
    return (
      <Alert className="mb-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-neutral-800 dark:text-white">Sem dados disponíveis</AlertTitle>
        <AlertDescription className="text-neutral-700 dark:text-neutral-300 space-y-4">
          <p>
            Não foram encontrados dados de análise para o período selecionado. 
            Tente selecionar um período diferente ou verificar se existem registros no sistema.
          </p>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar dados
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserGrowthChart data={data.usersByTime} />
        <PopularSolutionsChart data={data.solutionPopularity} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImplementationsByCategoryChart data={data.implementationsByCategory} />
        <CompletionRateChart data={data.userCompletionRate} />
        <WeeklyActivityChart data={data.dayOfWeekActivity} />
      </div>
    </div>
  );
};
