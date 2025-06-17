
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ModernLoadingStateProps {
  type?: 'stats' | 'chart' | 'table' | 'full';
  count?: number;
}

export const ModernLoadingState: React.FC<ModernLoadingStateProps> = ({
  type = 'full',
  count = 4
}) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(count).fill(0).map((_, i) => (
          <Card key={i} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300" />
                    <Skeleton className="h-8 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-200 to-purple-200" />
                </div>
                <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-green-200 to-emerald-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3 bg-gradient-to-r from-blue-200 to-purple-200" />
              <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'table') {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/4 bg-gradient-to-r from-blue-200 to-purple-200" />
              <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-gray-200 to-gray-300" />
            </div>
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
                    <Skeleton className="h-3 w-2/3 bg-gradient-to-r from-gray-100 to-gray-200" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-blue-200 to-purple-200" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full loading state
  return (
    <div className="space-y-8">
      {/* Stats loading */}
      <ModernLoadingState type="stats" count={4} />
      
      {/* Charts loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernLoadingState type="chart" />
        <ModernLoadingState type="chart" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ModernLoadingState type="chart" />
        <ModernLoadingState type="chart" />
        <ModernLoadingState type="chart" />
      </div>
    </div>
  );
};
