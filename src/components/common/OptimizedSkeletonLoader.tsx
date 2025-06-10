
import React, { memo, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OptimizedSkeletonLoaderProps {
  variant: 'dashboard' | 'solutions-grid' | 'kpi-cards' | 'solution-card' | 'header' | 'trail-card';
  count?: number;
  className?: string;
  animate?: boolean;
}

const OptimizedSkeletonLoader = memo<OptimizedSkeletonLoaderProps>(({ 
  variant,
  count = 1,
  className,
  animate = true
}) => {
  const skeletonContent = useMemo(() => {
    const baseClass = cn(
      animate && "animate-pulse",
      className
    );

    switch (variant) {
      case 'dashboard':
        return (
          <div className={cn("space-y-8", baseClass)}>
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>

            {/* Trail Card */}
            <div className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        );

      case 'solutions-grid':
        return (
          <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", baseClass)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'kpi-cards':
        return (
          <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", baseClass)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        );

      case 'solution-card':
        return (
          <div className={cn("border rounded-lg overflow-hidden", baseClass)}>
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        );

      case 'header':
        return (
          <div className={cn("space-y-4", baseClass)}>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        );

      case 'trail-card':
        return (
          <div className={cn("border rounded-lg p-6 space-y-4", baseClass)}>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-32" />
          </div>
        );

      default:
        return <Skeleton className={cn("h-4 w-full", baseClass)} />;
    }
  }, [variant, count, baseClass]);

  return skeletonContent;
});

OptimizedSkeletonLoader.displayName = 'OptimizedSkeletonLoader';

export default OptimizedSkeletonLoader;
