
import { useEffect, useCallback } from 'react';

// Mapeamento estático para importações dinâmicas
const routeMap: Record<string, () => Promise<any>> = {
  '/solutions': () => import('../../pages/member/Solutions'),
  '/implementation': () => import('../../pages/member/ImplementationTrail'),
  '/profile': () => import('../../pages/member/Profile'),
};

// Preload inteligente de rotas críticas
export const usePreloadRoutes = () => {
  const preloadRoute = useCallback((routePath: keyof typeof routeMap) => {
    const importFn = routeMap[routePath];
    if (!importFn) return;

    // Preload apenas em idle time para não impactar a performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Lida silenciosamente com falhas no preload
        });
      });
    } else {
      // Fallback para navegadores sem requestIdleCallback
      setTimeout(() => {
        importFn().catch(() => {
          // Lida silenciosamente com falhas no preload
        });
      }, 2000);
    }
  }, []);

  useEffect(() => {
    // Preload rotas mais acessadas após um tempo
    const timer = setTimeout(() => {
      preloadRoute('/solutions');
      preloadRoute('/implementation');
      preloadRoute('/profile');
    }, 2000);

    return () => clearTimeout(timer);
  }, [preloadRoute]);

  return { preloadRoute };
};
