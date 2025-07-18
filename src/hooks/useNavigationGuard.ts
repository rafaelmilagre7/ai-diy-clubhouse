
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook simplificado para prevenir loops de navegação
 * Remove verificações complexas e circuit breakers
 */
export const useNavigationGuard = () => {
  const location = useLocation();
  const navigationHistory = useRef<string[]>([]);
  const lastSafeRoute = useRef<string>('/dashboard');

  // Logging básico apenas
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Manter histórico simples (últimas 5 rotas)
    navigationHistory.current = [
      ...navigationHistory.current.slice(-4),
      currentPath
    ];

    // Atualizar última rota segura (não de auth)
    if (!currentPath.startsWith('/login') && !currentPath.startsWith('/auth')) {
      lastSafeRoute.current = currentPath;
    }

    console.log(`[NAVIGATION] Navegando para: ${currentPath}`);
  }, [location.pathname]);

  const resetNavigationHistory = () => {
    navigationHistory.current = [];
  };

  return {
    resetNavigationHistory,
    currentPath: location.pathname,
    lastSafeRoute: lastSafeRoute.current
  };
};
