import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading state com shimmer effect para melhor UX
export const SolutionCardSkeleton = memo(() => (
  <Card className="overflow-hidden group animate-pulse">
    <CardContent className="p-6">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Progress skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </CardContent>
  </Card>
));

SolutionCardSkeleton.displayName = 'SolutionCardSkeleton';

// Grid de skeletons com stagger effect
interface SolutionsSkeletonGridProps {
  count?: number;
  title?: string;
}

export const SolutionsSkeletonGrid = memo(({ count = 3, title }: SolutionsSkeletonGridProps) => (
  <div className="space-y-6">
    {title && (
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i} 
          className="animate-fade-in"
          style={{ 
            animationDelay: `${i * 100}ms`,
            animationFillMode: 'backwards'
          }}
        >
          <SolutionCardSkeleton />
        </div>
      ))}
    </div>
  </div>
));

SolutionsSkeletonGrid.displayName = 'SolutionsSkeletonGrid';

// Loading overlay para transições suaves
export const SmoothTransitionLoader = memo(({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
});

SmoothTransitionLoader.displayName = 'SmoothTransitionLoader';