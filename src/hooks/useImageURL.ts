
import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  priority?: 'high' | 'normal' | 'low';
}

export const useImageURL = () => {
  const [imageCache] = useState<Map<string, string>>(new Map());

  const optimizeImageURL = useCallback(async (
    src: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<string> => {
    const cacheKey = `${src}_${JSON.stringify(options)}`;
    
    // Return cached version if available
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    try {
      // For Supabase storage URLs, add optimization parameters
      if (src.includes('supabase') || src.includes('lovable-uploads')) {
        const url = new URL(src);
        
        if (options.width) url.searchParams.set('width', options.width.toString());
        if (options.height) url.searchParams.set('height', options.height.toString());
        if (options.quality) url.searchParams.set('quality', options.quality.toString());
        if (options.format) url.searchParams.set('format', options.format);
        
        const optimizedUrl = url.toString();
        imageCache.set(cacheKey, optimizedUrl);
        return optimizedUrl;
      }

      // For external URLs, return as-is but cache the result
      imageCache.set(cacheKey, src);
      return src;
    } catch (error) {
      console.warn('[useImageURL] Failed to optimize image URL:', error);
      return src;
    }
  }, [imageCache]);

  const preloadImage = useCallback((src: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    } else if (priority === 'low') {
      link.setAttribute('fetchpriority', 'low');
    }
    
    document.head.appendChild(link);
  }, []);

  return { optimizeImageURL, preloadImage };
};
