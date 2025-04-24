
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { SolutionBackButton } from "./SolutionBackButton";

export const SolutionSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <SolutionBackButton />
      
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
      
      {/* Content Skeleton */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};
