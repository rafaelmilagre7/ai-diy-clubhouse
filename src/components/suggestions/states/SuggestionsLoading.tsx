
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SuggestionsLoading = () => {
  return (
    <div className="container py-8 max-w-7xl">
      {/* Header Loading */}
      <div className="text-center space-y-4 mb-8">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto" />
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Filters Loading */}
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      
      {/* Content Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-64">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
