import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ConnectionCardSkeleton = () => (
  <Card className="aurora-glass border-aurora/20 overflow-hidden">
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  </Card>
);
