
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SuggestionsPerformanceWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SuggestionsFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="animate-pulse">
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-4/5 mb-2 shimmer" />
          <Skeleton className="h-4 w-2/5 shimmer" />
          <Skeleton className="h-20 w-full shimmer" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-16 shimmer" />
            <Skeleton className="h-4 w-12 shimmer" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const SuggestionsErrorFallback = ({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <Card className="text-center py-12">
    <CardContent>
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Erro ao carregar sugestões
      </h3>
      <p className="text-muted-foreground mb-6">
        {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <Button onClick={resetErrorBoundary} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </CardContent>
  </Card>
);

export const SuggestionsPerformanceWrapper: React.FC<SuggestionsPerformanceWrapperProps> = ({
  children,
  fallback = <SuggestionsFallback />
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={SuggestionsErrorFallback}
      onError={(error) => {
        console.error('🚨 Erro no wrapper de performance das sugestões:', error);
      }}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
