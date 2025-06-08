
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

interface SolutionsGridLoaderProps {
  title: string;
  count?: number;
}

export const SolutionsGridLoader: FC<SolutionsGridLoaderProps> = ({ 
  title, 
  count = 3 
}) => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} variant="elevated" className="overflow-hidden">
            {/* Thumbnail skeleton */}
            <Skeleton className="h-48 w-full rounded-t-xl" />
            
            <div className="p-6 space-y-4">
              {/* Header badges */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              
              {/* Title and description */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
