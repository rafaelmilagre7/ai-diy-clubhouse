
import React, { memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

// Componente de imagem otimizado com lazy loading
export const LazyImage = memo<LazyImageProps>(({ 
  src, 
  alt, 
  className, 
  fallback,
  onLoad,
  onError 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';
