
import { useCallback } from 'react';

/**
 * Hook para preload estratégico de rotas
 */
export const usePreloadRoute = () => {
  const preloadRoute = useCallback((routePath: string) => {
    // Preload baseado no padrão de rotas
    if (routePath.startsWith('/learning')) {
      import('@/pages/member/learning/LearningPage');
    } else if (routePath.startsWith('/comunidade')) {
      import('@/pages/member/community/CommunityHome');
    } else if (routePath.startsWith('/networking')) {
      import('@/pages/member/networking/NetworkingPage');
    } else if (routePath === '/events') {
      import('@/pages/member/Events');
    } else if (routePath === '/benefits') {
      import('@/pages/member/Benefits');
    } else if (routePath.startsWith('/suggestions')) {
      import('@/pages/member/Suggestions');
    }
  }, []);

  return { preloadRoute };
};
