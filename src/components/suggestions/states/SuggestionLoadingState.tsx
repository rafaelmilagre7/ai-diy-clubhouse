
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SuggestionHeader from '../SuggestionHeader';

const SuggestionLoadingState = () => {
  return (
    <div className="container py-6">
      <SuggestionHeader />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
      </Card>
    </div>
  );
};

export default SuggestionLoadingState;
