
import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import LoadingScreen from './LoadingScreen';

interface LazyComponentLoaderProps {
  Component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

// Loader universal para componentes lazy usando LoadingScreen consolidado
export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({ 
  Component, 
  fallback,
  ...props 
}) => {
  const defaultFallback = (
    <LoadingScreen
      message="Carregando componente"
      variant="spinner"
      size="md"
      fullScreen={false}
      className="h-32"
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
};
