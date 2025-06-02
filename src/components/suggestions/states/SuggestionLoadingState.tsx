
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SuggestionLoadingState = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-2 shimmer" />
      </div>

      {/* Content skeleton */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4 mb-3 shimmer" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 shimmer" />
                <Skeleton className="h-6 w-24 shimmer" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 shimmer" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full shimmer" />
            <Skeleton className="h-4 w-5/6 shimmer" />
            <Skeleton className="h-4 w-4/6 shimmer" />
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-8 w-16 shimmer" />
            <Skeleton className="h-8 w-16 shimmer" />
            <Skeleton className="h-8 w-24 shimmer" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32 shimmer" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full shimmer" />
                    <Skeleton className="h-4 w-24 shimmer" />
                    <Skeleton className="h-4 w-16 shimmer" />
                  </div>
                  <Skeleton className="h-16 w-full shimmer" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionLoadingState;
