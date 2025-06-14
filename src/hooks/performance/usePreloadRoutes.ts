
import { useEffect, useCallback } from 'react';

// Preload inteligente de rotas críticas
export const usePreloadRoutes = () => {
  const preloadRoute = useCallback((routePath: string) => {
    // Preload apenas em idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import(/* webpackChunkName: "preload-[request]" */ `../../pages${routePath}`).catch(() => {
          // Silently handle preload failures
        });
      });
    }
  }, []);

  useEffect(() => {
    // Preload rotas mais acessadas após 2 segundos
    const timer = setTimeout(() => {
      preloadRoute('/solutions');
      preloadRoute('/implementation');
      preloadRoute('/profile');
    }, 2000);

    return () => clearTimeout(timer);
  }, [preloadRoute]);

  return { preloadRoute };
};
