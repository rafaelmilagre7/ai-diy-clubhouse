import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface NavigationState {
  path: string;
  timestamp: number;
  userId?: string;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

/**
 * Hook avançado para prevenção de loops e controle inteligente de navegação
 */
export const useAdvancedNavigationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navigationHistory = useRef<NavigationState[]>([]);
  const circuitBreaker = useRef<CircuitBreakerState>({
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextAttemptTime: 0
  });
  
  const fallbackRoutes = useRef(['/dashboard', '/learning', '/tools', '/']);
  const currentFallbackIndex = useRef(0);

  // Circuit breaker para falhas de navegação
  const checkCircuitBreaker = useCallback(() => {
    const now = Date.now();
    const cb = circuitBreaker.current;
    
    // Se circuit breaker está aberto, verificar se pode tentar novamente
    if (cb.isOpen && now > cb.nextAttemptTime) {
      cb.isOpen = false;
      cb.failureCount = 0;
      logger.info('[NAV-GUARD] Circuit breaker reset');
    }
    
    return !cb.isOpen;
  }, []);

  // Registrar falha no circuit breaker
  const recordFailure = useCallback(() => {
    const cb = circuitBreaker.current;
    cb.failureCount++;
    cb.lastFailureTime = Date.now();
    
    // Abrir circuit breaker após 3 falhas
    if (cb.failureCount >= 3) {
      cb.isOpen = true;
      cb.nextAttemptTime = Date.now() + (5000 * cb.failureCount); // Backoff exponencial
      logger.warn('[NAV-GUARD] Circuit breaker aberto', {
        failureCount: cb.failureCount,
        nextAttempt: new Date(cb.nextAttemptTime)
      });
    }
  }, []);

  // Detectar loops inteligente com múltiplas heurísticas
  const detectNavigationLoop = useCallback(async () => {
    const now = Date.now();
    const currentPath = location.pathname;
    
    // Adicionar ao histórico local
    navigationHistory.current.push({
      path: currentPath,
      timestamp: now,
      userId: user?.id
    });

    // Limpar histórico antigo (últimos 60 segundos)
    navigationHistory.current = navigationHistory.current.filter(
      event => now - event.timestamp < 60000
    );

    // Análise de loops locais
    const recentEvents = navigationHistory.current.filter(
      event => now - event.timestamp < 15000 // Últimos 15 segundos
    );

    const pathCounts: Record<string, number> = {};
    recentEvents.forEach(event => {
      pathCounts[event.path] = (pathCounts[event.path] || 0) + 1;
    });

    // Detectar loop local (mais de 4 visitas em 15 segundos)
    const localLoop = Object.entries(pathCounts).some(([path, count]) => count > 4);

    // Detectar loop no banco de dados se usuário logado
    let databaseLoop = false;
    if (user?.id) {
      try {
        const { data: loopData } = await supabase.rpc('detect_navigation_loop', {
          p_user_id: user.id,
          p_path: currentPath,
          p_session_id: user.id + '_' + Date.now()
        });
        
        databaseLoop = loopData?.is_loop || false;
      } catch (error) {
        logger.error('[NAV-GUARD] Erro ao verificar loop no banco:', error);
      }
    }

    return {
      hasLoop: localLoop || databaseLoop,
      pathCounts,
      recentEventsCount: recentEvents.length,
      source: localLoop ? 'local' : databaseLoop ? 'database' : 'none'
    };
  }, [location.pathname, user?.id]);

  // Navegação segura com fallback
  const navigateToSafeRoute = useCallback(() => {
    if (!checkCircuitBreaker()) {
      logger.error('[NAV-GUARD] Circuit breaker aberto, não pode navegar');
      return;
    }

    const fallback = fallbackRoutes.current[currentFallbackIndex.current];
    
    try {
      logger.info('[NAV-GUARD] Navegando para rota segura', { fallback });
      navigate(fallback, { replace: true });
      currentFallbackIndex.current = 0; // Reset em caso de sucesso
    } catch (error) {
      logger.error('[NAV-GUARD] Erro ao navegar para rota segura:', error);
      recordFailure();
      
      // Tentar próximo fallback
      currentFallbackIndex.current = (currentFallbackIndex.current + 1) % fallbackRoutes.current.length;
      
      if (currentFallbackIndex.current === 0) {
        // Se tentou todos os fallbacks, force reload
        logger.error('[NAV-GUARD] Todos os fallbacks falharam, recarregando página');
        window.location.href = '/dashboard';
      }
    }
  }, [navigate, checkCircuitBreaker, recordFailure]);

  // Efeito principal de monitoramento
  useEffect(() => {
    const monitorNavigation = async () => {
      try {
        const loopAnalysis = await detectNavigationLoop();
        
        if (loopAnalysis.hasLoop) {
          logger.error('[NAV-GUARD] Loop detectado', {
            path: location.pathname,
            source: loopAnalysis.source,
            pathCounts: loopAnalysis.pathCounts,
            recentEventsCount: loopAnalysis.recentEventsCount
          });
          
          // Aguardar um pouco antes de redirecionar para evitar race conditions
          setTimeout(() => {
            navigateToSafeRoute();
          }, 100);
        }
      } catch (error) {
        logger.error('[NAV-GUARD] Erro no monitoramento:', error);
        recordFailure();
      }
    };

    monitorNavigation();
  }, [location.pathname, detectNavigationLoop, navigateToSafeRoute, recordFailure]);

  // Função para resetar estado quando necessário
  const resetNavigationState = useCallback(() => {
    navigationHistory.current = [];
    circuitBreaker.current = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };
    currentFallbackIndex.current = 0;
    logger.info('[NAV-GUARD] Estado de navegação resetado');
  }, []);

  // Função para navegação controlada
  const safeNavigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (!checkCircuitBreaker()) {
      logger.warn('[NAV-GUARD] Navegação bloqueada pelo circuit breaker');
      return false;
    }

    try {
      navigate(path, options);
      return true;
    } catch (error) {
      logger.error('[NAV-GUARD] Erro na navegação segura:', error);
      recordFailure();
      return false;
    }
  }, [navigate, checkCircuitBreaker, recordFailure]);

  return {
    navigateToSafeRoute,
    resetNavigationState,
    safeNavigate,
    currentPath: location.pathname,
    isCircuitBreakerOpen: circuitBreaker.current.isOpen,
    navigationHealth: {
      failureCount: circuitBreaker.current.failureCount,
      recentEvents: navigationHistory.current.length,
      lastFailure: circuitBreaker.current.lastFailureTime
    }
  };
};