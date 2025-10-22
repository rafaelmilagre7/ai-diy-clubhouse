import { Skeleton } from '@/components/ui/skeleton';

export const NotificationsSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex gap-3 p-4 bg-card rounded-lg border border-border">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);
