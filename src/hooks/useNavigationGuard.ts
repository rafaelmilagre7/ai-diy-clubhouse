import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationEvent {
  path: string;
  timestamp: number;
}

/**
 * Hook para prevenir loops de navegação e detectar problemas de roteamento
 */
export const useNavigationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationHistory = useRef<NavigationEvent[]>([]);
  const lastSafeRoute = useRef<string>('/dashboard');

  useEffect(() => {
    const now = Date.now();
    const currentPath = location.pathname;

    // Adicionar evento atual ao histórico
    navigationHistory.current.push({
      path: currentPath,
      timestamp: now
    });

    // Limpar eventos antigos (mais de 30 segundos)
    navigationHistory.current = navigationHistory.current.filter(
      event => now - event.timestamp < 30000
    );

    // Detectar loops de navegação
    const recentEvents = navigationHistory.current.filter(
      event => now - event.timestamp < 10000 // Últimos 10 segundos
    );

    const pathCounts: Record<string, number> = {};
    recentEvents.forEach(event => {
      pathCounts[event.path] = (pathCounts[event.path] || 0) + 1;
    });

    // Se houver mais de 5 navegações para a mesma rota em 10 segundos
    Object.entries(pathCounts).forEach(([path, count]) => {
      if (count > 5) {
        console.error(`[NAVIGATION] Loop detectado: ${path} (${count} vezes)`);
        
        // Redirecionar para rota segura
        if (path !== lastSafeRoute.current) {
          console.log(`[NAVIGATION] Redirecionando para rota segura: ${lastSafeRoute.current}`);
          navigate(lastSafeRoute.current, { replace: true });
          return;
        }
      }
    });

    // Atualizar última rota segura se não há loops
    if (pathCounts[currentPath] <= 2) {
      // Apenas atualizar se for uma rota "segura"
      const safeRoutes = ['/dashboard', '/learning', '/networking', '/tools'];
      if (safeRoutes.some(route => currentPath.startsWith(route))) {
        lastSafeRoute.current = currentPath;
      }
    }

    console.log(`[NAVIGATION] Navegando para: ${currentPath}`, {
      recent_events: recentEvents.length,
      path_counts: pathCounts
    });

  }, [location.pathname, navigate]);

  const navigateToSafeRoute = () => {
    navigate(lastSafeRoute.current, { replace: true });
  };

  const resetNavigationHistory = () => {
    navigationHistory.current = [];
  };

  return {
    navigateToSafeRoute,
    resetNavigationHistory,
    currentPath: location.pathname,
    lastSafeRoute: lastSafeRoute.current
  };
};