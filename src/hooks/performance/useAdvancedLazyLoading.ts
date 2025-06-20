
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface LazyLoadingOptions {
  preloadRoutes?: string[];
  preloadDelay?: number;
  priority?: 'high' | 'normal' | 'low';
}

export const useAdvancedLazyLoading = (options: LazyLoadingOptions = {}) => {
  const { preloadRoutes = [], preloadDelay = 1000, priority = 'normal' } = options;
  const location = useLocation();
  const preloadedRoutes = useRef<Set<string>>(new Set());

  // Preload inteligente baseado na rota atual
  const preloadRoute = useCallback((routePath: string) => {
    if (preloadedRoutes.current.has(routePath)) {
      return;
    }

    const preloadFunction = () => {
      preloadedRoutes.current.add(routePath);
      
      // Mapear rotas para imports dinâmicos - usando caminhos corretos
      const routeImports: Record<string, () => Promise<any>> = {
        '/dashboard': () => import('../../pages/member/Dashboard'),
        '/solutions': () => import('../../pages/member/Solutions'),
        '/tools': () => import('../../pages/member/Tools'),
        '/learning': () => import('../../pages/member/learning/LearningPage'),
        '/profile': () => import('../../pages/member/Profile'),
        '/implementation': () => import('../../pages/member/ImplementationTrail'),
        '/community': () => import('../../pages/member/community/CommunityHome')
      };

      const importFn = routeImports[routePath];
      if (importFn) {
        importFn().catch(console.warn);
      }
    };

    // Usar requestIdleCallback para prioridade baixa
    if (priority === 'low' && 'requestIdleCallback' in window) {
      requestIdleCallback(preloadFunction);
    } else if (priority === 'high') {
      preloadFunction();
    } else {
      setTimeout(preloadFunction, preloadDelay);
    }
  }, [preloadDelay, priority]);

  // Preload automático baseado na navegação
  useEffect(() => {
    const navigationPatterns: Record<string, string[]> = {
      '/dashboard': ['/solutions', '/tools', '/implementation'],
      '/solutions': ['/implementation', '/dashboard'],
      '/tools': ['/dashboard', '/solutions'],
      '/learning': ['/dashboard', '/profile'],
      '/profile': ['/dashboard', '/learning'],
      '/implementation': ['/dashboard', '/solutions'],
      '/community': ['/dashboard', '/solutions']
    };

    const currentRoute = location.pathname;
    const routesToPreload = navigationPatterns[currentRoute] || [];

    routesToPreload.forEach(route => {
      preloadRoute(route);
    });

    // Preload rotas customizadas
    preloadRoutes.forEach(route => {
      preloadRoute(route);
    });
  }, [location.pathname, preloadRoute, preloadRoutes]);

  return { preloadRoute };
};
