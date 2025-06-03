
import { useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface PreloadedRoute {
  path: string;
  timestamp: number;
  component?: any;
}

/**
 * Hook para preload inteligente de rotas
 * Cache de componentes carregados para melhor performance
 */
export const usePreloadRoute = () => {
  const preloadedRoutes = useRef<Map<string, PreloadedRoute>>(new Map());
  const preloadingInProgress = useRef<Set<string>>(new Set());

  const preloadRoute = useCallback(async (routePath: string) => {
    // Evitar preload duplicado
    if (preloadingInProgress.current.has(routePath)) {
      return;
    }

    // Verificar se já está em cache (válido por 5 minutos)
    const cached = preloadedRoutes.current.get(routePath);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.component;
    }

    preloadingInProgress.current.add(routePath);

    try {
      let componentPromise: Promise<any> | null = null;

      // Mapear rotas para seus componentes
      switch (routePath) {
        case '/solutions':
        case '/solucoes':
          componentPromise = import('@/pages/member/Solutions');
          break;
        case '/tools':
        case '/ferramentas':
          componentPromise = import('@/pages/member/Tools');
          break;
        case '/learning':
        case '/aprendizado':
          componentPromise = import('@/pages/member/learning/LearningPage');
          break;
        case '/community':
        case '/comunidade':
          componentPromise = import('@/pages/member/community/CommunityPage');
          break;
        case '/networking':
          componentPromise = import('@/pages/member/networking/NetworkingPage');
          break;
        case '/implementation-trail':
        case '/trilha-implementacao':
          componentPromise = import('@/pages/member/ImplementationTrailPage');
          break;
        case '/profile':
        case '/perfil':
          componentPromise = import('@/pages/member/Profile');
          break;
        default:
          logger.warn('Rota não mapeada para preload', { routePath });
          return null;
      }

      if (componentPromise) {
        const component = await componentPromise;
        
        // Armazenar no cache
        preloadedRoutes.current.set(routePath, {
          path: routePath,
          timestamp: Date.now(),
          component
        });

        logger.info('Rota precarregada com sucesso', { routePath });
        return component;
      }
    } catch (error) {
      logger.error('Erro ao precarregar rota', { routePath, error });
    } finally {
      preloadingInProgress.current.delete(routePath);
    }

    return null;
  }, []);

  const getPreloadedRoute = useCallback((routePath: string) => {
    return preloadedRoutes.current.get(routePath);
  }, []);

  const clearPreloadCache = useCallback(() => {
    preloadedRoutes.current.clear();
    preloadingInProgress.current.clear();
  }, []);

  return {
    preloadRoute,
    getPreloadedRoute,
    clearPreloadCache
  };
};
