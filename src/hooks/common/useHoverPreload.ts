
import { useCallback } from 'react';
import { usePreloadRoute } from './usePreloadRoute';

/**
 * Hook para preload em hover de links
 */
export const useHoverPreload = () => {
  const { preloadRoute } = usePreloadRoute();

  const handleMouseEnter = useCallback((routePath: string) => {
    // Preload com delay para evitar preloads desnecessários
    const timeoutId = setTimeout(() => {
      preloadRoute(routePath);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [preloadRoute]);

  return { handleMouseEnter };
};
