import { ErrorBoundary } from 'react-error-boundary';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-feature-block flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Algo deu errado</AlertTitle>
          <AlertDescription>
            {isDevelopment 
              ? error.message 
              : 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.'
            }
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          <Button onClick={resetErrorBoundary} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="outline" 
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>

        {isDevelopment && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Stack trace (desenvolvimento)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

interface OptimizedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

/**
 * ErrorBoundary otimizado que evita re-renders desnecessários
 * e fornece melhor UX para erros
 */
export const OptimizedErrorBoundary: React.FC<OptimizedErrorBoundaryProps> = ({ 
  children, 
  fallback: FallbackComponent = ErrorFallback 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => {
        // Log apenas em desenvolvimento ou erros críticos
        if (import.meta.env.DEV) {
          console.error('🚨 [ERROR-BOUNDARY] Erro capturado:', error, errorInfo);
        } else {
          // Em produção, log apenas o essencial
          console.error('Error:', error.message);
        }
      }}
      onReset={() => {
        // Opcional: limpar cache ou estado
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};