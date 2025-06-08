
import { FC } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";

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
      {/* Section Header Skeleton */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </Card>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card 
            key={index} 
            variant="elevated" 
            className="overflow-hidden animate-pulse"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Thumbnail Skeleton */}
            <div className="relative h-48 bg-surface-elevated">
              <Skeleton className="w-full h-full" />
              
              {/* Overlay elements */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <Skeleton className="h-5 w-16 rounded-full mb-2" />
              </div>
            </div>

            {/* Content Skeleton */}
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
