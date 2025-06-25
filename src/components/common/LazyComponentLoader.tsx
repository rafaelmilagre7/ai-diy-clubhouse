
import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentLoaderProps {
  Component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

// Loader universal para componentes lazy
export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({ 
  Component, 
  fallback,
  ...props 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-6 w-6 animate-spin text-viverblue" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
};
