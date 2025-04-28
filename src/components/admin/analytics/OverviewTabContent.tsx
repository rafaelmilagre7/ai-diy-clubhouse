
import React from 'react';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { CompletionRateChart } from './CompletionRateChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface OverviewTabContentProps {
  loading?: boolean;
  data: {
    usersByTime: any[];
    solutionPopularity: any[];
    implementationsByCategory: any[];
    userCompletionRate: any[];
    dayOfWeekActivity: any[];
  };
}

export const OverviewTabContent = ({ 
  loading = false, 
  data 
}: OverviewTabContentProps) => {
  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(2).fill(null).map((_, index) => (
          <Card key={`skeleton-top-${index}`}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-[150px] mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(null).map((_, i) => (
          <Card key={`skeleton-bottom-${i}`}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[100px] mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Verifica se dados estão vazios em todos os arrays
  const hasData = Object.values(data).some(arr => arr && arr.length > 0);

  if (loading) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserGrowthChart 
          data={data.usersByTime} 
          isEmpty={!data.usersByTime || data.usersByTime.length === 0} 
        />
        <PopularSolutionsChart 
          data={data.solutionPopularity} 
          isEmpty={!data.solutionPopularity || data.solutionPopularity.length === 0} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImplementationsByCategoryChart 
          data={data.implementationsByCategory} 
          isEmpty={!data.implementationsByCategory || data.implementationsByCategory.length === 0} 
        />
        <CompletionRateChart 
          data={data.userCompletionRate} 
          isEmpty={!data.userCompletionRate || data.userCompletionRate.length === 0} 
        />
        <WeeklyActivityChart 
          data={data.dayOfWeekActivity} 
          isEmpty={!data.dayOfWeekActivity || data.dayOfWeekActivity.length === 0} 
        />
      </div>
    </div>
  );
};
