
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AccessPerformanceWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  fallback?: React.ReactNode;
  timeout?: number;
}

export const AccessPerformanceWrapper: React.FC<AccessPerformanceWrapperProps> = ({
  children,
  isLoading = false,
  fallback,
  timeout = 5000
}) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowFallback(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  if (isLoading) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-viverblue" />
        <span className="ml-2 text-sm text-muted-foreground">
          Verificando permissões...
        </span>
      </div>
    );
  }

  return <>{children}</>;
};
