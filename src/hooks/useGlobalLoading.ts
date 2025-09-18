
import { useState, useEffect, useRef, useCallback } from 'react';

interface LoadingState {
  auth: boolean;
  data: boolean;
  navigation: boolean;
  global: boolean;
}

interface LoadingConfig {
  timeout?: number;
  enableCircuitBreaker?: boolean;
  retryAttempts?: number;
}

const DEFAULT_CONFIG: LoadingConfig = {
  timeout: 3000, // 3 segundos para evitar loops longos
  enableCircuitBreaker: true,
  retryAttempts: 1 // Reduzido para evitar loops
};

export const useGlobalLoading = (config: LoadingConfig = DEFAULT_CONFIG) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    auth: true,
    data: false,
    navigation: false,
    global: true
  });
  
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Circuit breaker para prevenir loading infinito
  useEffect(() => {
    if (config.enableCircuitBreaker && loadingState.global) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (retryCount < (config.retryAttempts || 0)) {
          console.warn(`[GLOBAL-LOADING] Circuit breaker - retry ${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
        } else {
          console.warn('[GLOBAL-LOADING] Circuit breaker ativado - forçando fim do loading');
          setCircuitBreakerActive(true);
          setLoadingState(prev => ({
            ...prev,
            auth: false,
            data: false,
            navigation: false,
            global: false
          }));
        }
      }, config.timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadingState.global, retryCount, config.timeout, config.retryAttempts, config.enableCircuitBreaker]);

  const setLoading = useCallback((type: keyof LoadingState, value: boolean) => {
    setLoadingState(prev => {
      const newState = { ...prev, [type]: value };
      // Global loading é verdadeiro se qualquer um dos outros for verdadeiro
      newState.global = newState.auth || newState.data || newState.navigation;
      
      // Reset circuit breaker quando loading para
      if (!newState.global && circuitBreakerActive) {
        setCircuitBreakerActive(false);
        setRetryCount(0);
      }
      
      return newState;
    });
  }, [circuitBreakerActive]);

  const forceComplete = useCallback(() => {
    console.log('[GLOBAL-LOADING] Forçando finalização de todos os loadings');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoadingState({
      auth: false,
      data: false,
      navigation: false,
      global: false
    });
    setCircuitBreakerActive(true);
    setRetryCount(0);
  }, []);

  const reset = useCallback(() => {
    console.log('[GLOBAL-LOADING] Reset do sistema de loading');
    setLoadingState({
      auth: true,
      data: false,
      navigation: false,
      global: true
    });
    setCircuitBreakerActive(false);
    setRetryCount(0);
    startTimeRef.current = Date.now();
  }, []);

  const getLoadingDuration = useCallback(() => {
    return Date.now() - startTimeRef.current;
  }, []);

  return {
    loadingState,
    setLoading,
    forceComplete,
    reset,
    circuitBreakerActive,
    retryCount,
    getLoadingDuration,
    isAnyLoading: loadingState.global
  };
};
