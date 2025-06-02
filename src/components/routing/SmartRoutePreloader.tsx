
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePreloadRoute } from '@/hooks/common/usePreloadRoute';

/**
 * Componente para preload inteligente de rotas baseado na navegação do usuário
 */
export const SmartRoutePreloader = () => {
  const location = useLocation();
  const { preloadRoute } = usePreloadRoute();

  useEffect(() => {
    // Preload rotas relacionadas baseado na rota atual
    const currentPath = location.pathname;
    
    // Se está no dashboard, preload das rotas mais acessadas
    if (currentPath === '/dashboard' || currentPath === '/') {
      setTimeout(() => {
        preloadRoute('/solutions');
        preloadRoute('/tools');
      }, 2000);
    }
    
    // Se está em solutions, preload implementation
    if (currentPath === '/solutions') {
      setTimeout(() => {
        preloadRoute('/implementation-trail');
      }, 1000);
    }
    
    // Se está em learning, preload community
    if (currentPath.startsWith('/learning')) {
      setTimeout(() => {
        preloadRoute('/comunidade');
      }, 1500);
    }
    
  }, [location.pathname, preloadRoute]);

  return null; // Este componente não renderiza nada
};
