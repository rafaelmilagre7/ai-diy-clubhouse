
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  type: 'dashboard' | 'profile' | 'card' | 'list';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        );

      case 'card':
        return (
          <div className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        );

      default:
        return <Skeleton className="h-4 w-full" />;
    }
  };

  return <>{renderSkeleton()}</>;
};
