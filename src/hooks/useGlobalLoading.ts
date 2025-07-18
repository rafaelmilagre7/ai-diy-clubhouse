
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
  timeout: 8000, // Timeout mais alto
  enableCircuitBreaker: false, // Desabilitar circuit breaker por padrão
  retryAttempts: 1 // Reduzir tentativas
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

  // Circuit breaker simplificado
  useEffect(() => {
    if (config.enableCircuitBreaker && loadingState.global) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (retryCount < (config.retryAttempts || 0)) {
          console.warn(`[GLOBAL-LOADING] Timeout - retry ${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
        } else {
          console.warn('[GLOBAL-LOADING] Forçando fim do loading');
          setCircuitBreakerActive(true);
          setLoadingState({
            auth: false,
            data: false,
            navigation: false,
            global: false
          });
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
      newState.global = newState.auth || newState.data || newState.navigation;
      
      if (!newState.global && circuitBreakerActive) {
        setCircuitBreakerActive(false);
        setRetryCount(0);
      }
      
      return newState;
    });
  }, [circuitBreakerActive]);

  const forceComplete = useCallback(() => {
    console.log('[GLOBAL-LOADING] Forçando finalização');
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
    console.log('[GLOBAL-LOADING] Reset');
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
