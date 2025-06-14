
import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { useAdvancedLazyLoading } from '@/hooks/performance/useAdvancedLazyLoading';
import OptimizedLoadingScreen from '../common/OptimizedLoadingScreen';

interface RouteBasedLazyLoaderProps {
  Component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  preloadRoutes?: string[];
  priority?: 'high' | 'normal' | 'low';
  [key: string]: any;
}

// Loader inteligente para componentes com preload estratégico
export const RouteBasedLazyLoader: React.FC<RouteBasedLazyLoaderProps> = ({ 
  Component, 
  fallback,
  preloadRoutes,
  priority = 'normal',
  ...props 
}) => {
  // Ativar preload inteligente
  useAdvancedLazyLoading({ preloadRoutes, priority });

  const defaultFallback = (
    <OptimizedLoadingScreen 
      message="Carregando página"
      variant="spinner"
      size="lg"
      fullScreen={true}
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
};
