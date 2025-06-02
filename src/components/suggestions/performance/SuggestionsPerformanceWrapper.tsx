
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface SuggestionsPerformanceWrapperProps {
  children: React.ReactNode;
}

const SuggestionsErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="container py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-3">
          <p>Algo deu errado ao carregar o sistema de sugestões.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetErrorBoundary} 
            className="gap-2 w-fit"
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const SuggestionsPerformanceWrapper: React.FC<SuggestionsPerformanceWrapperProps> = ({ 
  children 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={SuggestionsErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Erro no sistema de sugestões:', error, errorInfo);
      }}
    >
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ErrorBoundary>
  );
};
