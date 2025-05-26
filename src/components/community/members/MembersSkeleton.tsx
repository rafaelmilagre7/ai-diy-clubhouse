
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const MembersSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full" />
              <div className="space-y-2 text-center w-full">
                <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
              </div>
              <div className="h-8 bg-muted rounded w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
