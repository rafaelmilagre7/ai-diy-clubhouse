
import React, { useState, useCallback } from 'react';
import { useImageURL } from '@/hooks/useImageURL';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  enableOptimization?: boolean;
  priority?: 'high' | 'normal' | 'low';
  className?: string;
  onLoadError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  enableOptimization = true,
  priority = 'normal',
  className = '',
  onLoadError,
  ...props
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { optimizeImageURL } = useImageURL();

  // Otimizar URL quando o componente montar
  React.useEffect(() => {
    if (enableOptimization && src) {
      setIsLoading(true);
      optimizeImageURL(src, { priority })
        .then(optimizedUrl => {
          setOptimizedSrc(optimizedUrl);
        })
        .catch(error => {
          console.warn('[OptimizedImage] Falha na otimização, usando URL original:', error);
          setOptimizedSrc(src);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [src, enableOptimization, priority, optimizeImageURL]);

  const handleError = useCallback(() => {
    console.warn('[OptimizedImage] Erro ao carregar imagem:', optimizedSrc);
    setHasError(true);
    
    // Tentar fallback se disponível
    if (fallbackSrc && optimizedSrc !== fallbackSrc) {
      setOptimizedSrc(fallbackSrc);
      setHasError(false);
    }
    
    if (onLoadError) {
      onLoadError();
    }
  }, [optimizedSrc, fallbackSrc, onLoadError]);

  const handleLoad = useCallback(() => {
    setHasError(false);
  }, []);

  // Mostrar placeholder enquanto carrega ou em caso de erro persistente
  if (isLoading) {
    return (
      <div 
        className={`bg-muted animate-pulse flex items-center justify-center ${className}`}
        {...props}
      >
        <span className="text-muted-foreground text-sm">Carregando...</span>
      </div>
    );
  }

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-muted/30 border border-border flex items-center justify-center ${className}`}
        {...props}
      >
        <span className="text-muted-foreground text-sm">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading={priority === 'high' ? 'eager' : 'lazy'}
      {...props}
    />
  );
};
