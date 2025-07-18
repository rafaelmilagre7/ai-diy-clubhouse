import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface AuthMetrics {
  loginAttempts: number;
  profileLoadTime: number;
  lastProfileLoad: number;
  errorCount: number;
  lastError: string | null;
}

/**
 * Hook para monitoramento avançado do estado de autenticação
 */
export const useAuthStateMonitor = () => {
  const { user, profile, isLoading, authError } = useAuth();
  const metrics = useRef<AuthMetrics>({
    loginAttempts: 0,
    profileLoadTime: 0,
    lastProfileLoad: 0,
    errorCount: 0,
    lastError: null
  });
  
  const profileLoadStartTime = useRef<number>(0);
  const lastAuthState = useRef<string>('initial');

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    const newState = user ? (profile ? 'authenticated_with_profile' : 'authenticated_no_profile') : 'unauthenticated';
    
    if (newState !== lastAuthState.current) {
      logger.info('[AUTH-MONITOR] Estado mudou', {
        from: lastAuthState.current,
        to: newState,
        loadingTime: profileLoadStartTime.current ? Date.now() - profileLoadStartTime.current : 0
      });
      
      // Se usuário logou, iniciar cronômetro para carregamento de perfil
      if (user && !profile && newState === 'authenticated_no_profile') {
        profileLoadStartTime.current = Date.now();
      }
      
      // Se perfil carregou, calcular tempo
      if (profile && profileLoadStartTime.current > 0) {
        const loadTime = Date.now() - profileLoadStartTime.current;
        metrics.current.profileLoadTime = loadTime;
        metrics.current.lastProfileLoad = Date.now();
        
        logger.info('[AUTH-MONITOR] Perfil carregado', {
          loadTime: `${loadTime}ms`,
          userId: user?.id
        });
        
        profileLoadStartTime.current = 0;
      }
      
      lastAuthState.current = newState;
    }
  }, [user, profile]);

  // Monitorar erros de autenticação
  useEffect(() => {
    if (authError) {
      metrics.current.errorCount++;
      metrics.current.lastError = authError.message;
      
      logger.error('[AUTH-MONITOR] Erro detectado', {
        error: authError.message,
        errorCount: metrics.current.errorCount,
        userId: user?.id
      });
    }
  }, [authError, user?.id]);

  // Detectar problemas de performance
  const detectPerformanceIssues = useCallback(() => {
    const issues: string[] = [];
    
    // Carregamento de perfil muito lento (> 5 segundos)
    if (metrics.current.profileLoadTime > 5000) {
      issues.push(`Carregamento de perfil lento: ${metrics.current.profileLoadTime}ms`);
    }
    
    // Muitos erros
    if (metrics.current.errorCount > 3) {
      issues.push(`Muitos erros de autenticação: ${metrics.current.errorCount}`);
    }
    
    // Loading há muito tempo
    if (isLoading && profileLoadStartTime.current > 0) {
      const currentLoadTime = Date.now() - profileLoadStartTime.current;
      if (currentLoadTime > 10000) {
        issues.push(`Loading prolongado: ${currentLoadTime}ms`);
      }
    }
    
    return issues;
  }, [isLoading]);

  // Função para obter métricas de debug
  const getDebugInfo = useCallback(() => {
    return {
      currentState: lastAuthState.current,
      metrics: { ...metrics.current },
      isCurrentlyLoading: isLoading,
      currentLoadTime: profileLoadStartTime.current > 0 ? 
        Date.now() - profileLoadStartTime.current : 0,
      performanceIssues: detectPerformanceIssues(),
      user: user ? {
        id: user.id,
        email: user.email
      } : null,
      profile: profile ? {
        id: profile.id,
        role: profile.user_roles?.name
      } : null
    };
  }, [isLoading, user, profile, detectPerformanceIssues]);

  // Função para resetar métricas
  const resetMetrics = useCallback(() => {
    metrics.current = {
      loginAttempts: 0,
      profileLoadTime: 0,
      lastProfileLoad: 0,
      errorCount: 0,
      lastError: null
    };
    profileLoadStartTime.current = 0;
    lastAuthState.current = 'reset';
    
    logger.info('[AUTH-MONITOR] Métricas resetadas');
  }, []);

  // Log periódico de status (a cada 30 segundos se loading)
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      const currentLoadTime = profileLoadStartTime.current > 0 ? 
        Date.now() - profileLoadStartTime.current : 0;
      
      logger.info('[AUTH-MONITOR] Status periódico', {
        state: lastAuthState.current,
        loadingTime: currentLoadTime,
        hasUser: !!user,
        hasProfile: !!profile,
        errorCount: metrics.current.errorCount
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, user, profile]);

  return {
    getDebugInfo,
    resetMetrics,
    detectPerformanceIssues,
    currentState: lastAuthState.current,
    metrics: metrics.current
  };
};