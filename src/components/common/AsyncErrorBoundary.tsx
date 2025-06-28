
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback'; // Corrigido: import default

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  fallback: FallbackComponent = ErrorFallback 
}) => {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ErrorBoundary>
  );
};

export default AsyncErrorBoundary;
