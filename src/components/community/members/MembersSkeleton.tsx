
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const MembersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Filtros skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 bg-muted rounded-md flex-1 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-44 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Grid de membros skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-12" />
              </div>
              
              <div className="flex gap-2">
                <div className="h-9 bg-muted rounded flex-1" />
                <div className="h-9 w-9 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginação skeleton */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 w-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};
