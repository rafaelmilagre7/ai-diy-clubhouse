import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationEvent {
  path: string;
  timestamp: number;
}

/**
 * Hook para prevenir loops de navegação e detectar problemas de roteamento
 * TEMPORARIAMENTE DESABILITADO PARA DEBUG
 */
export const useNavigationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationHistory = useRef<NavigationEvent[]>([]);
  const lastSafeRoute = useRef<string>('/dashboard');

  // TEMPORARIAMENTE DESABILITADO - Apenas logging básico
  useEffect(() => {
    console.log(`[NAVIGATION] Navegando para: ${location.pathname}`);
  }, [location.pathname]);

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