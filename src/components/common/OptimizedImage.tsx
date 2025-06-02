
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  quality?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  quality = 80,
  placeholder,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Gerar URLs otimizadas para diferentes formatos
  const getOptimizedSrc = (originalSrc: string) => {
    // Se for uma URL do Supabase Storage, adicionar parâmetros de otimização
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      url.searchParams.set('quality', quality.toString());
      return url.toString();
    }
    return originalSrc;
  };

  // Verificar suporte a WebP/AVIF
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  const getWebPSrc = (originalSrc: string) => {
    if (!supportsWebP() || !originalSrc.includes('supabase.co/storage')) {
      return originalSrc;
    }
    
    // Converter para WebP se suportado
    const url = new URL(originalSrc);
    url.searchParams.set('format', 'webp');
    return url.toString();
  };

  useEffect(() => {
    if (!src) return;

    const optimizedSrc = getOptimizedSrc(src);
    const webpSrc = getWebPSrc(optimizedSrc);
    
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(webpSrc);
      setIsLoaded(true);
      setIsError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      // Fallback para imagem original se WebP falhar
      if (webpSrc !== optimizedSrc) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCurrentSrc(optimizedSrc);
          setIsLoaded(true);
          setIsError(false);
          onLoad?.();
        };
        fallbackImg.onerror = () => {
          setIsError(true);
          onError?.();
        };
        fallbackImg.src = optimizedSrc;
      } else {
        setIsError(true);
        onError?.();
      }
    };
    
    img.src = webpSrc;
  }, [src, width, height, quality]);

  if (isError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
        className
      )}>
        <span className="text-gray-400 text-sm">Imagem não encontrada</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder durante carregamento */}
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-50"
          loading="eager"
        />
      )}
      
      {/* Skeleton durante carregamento */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      
      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setIsError(true);
          onError?.();
        }}
      />
    </div>
  );
};
