
import { FC } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <Card variant="elevated" className="p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="hidden md:block">
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </Card>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card 
            key={index} 
            variant="elevated" 
            className="h-full overflow-hidden animate-pulse"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Image skeleton */}
            <div className="h-48 bg-gradient-to-br from-surface-elevated to-surface-hover">
              <Skeleton className="w-full h-full" />
            </div>
            
            <CardHeader className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
