
import { useState, useCallback } from 'react';

interface LoadingState {
  auth: boolean;
  data: boolean;
  navigation: boolean;
  global: boolean;
}

export const useGlobalLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    auth: true,
    data: false,
    navigation: false,
    global: true
  });

  const setLoading = useCallback((type: keyof LoadingState, value: boolean) => {
    setLoadingState(prev => {
      const newState = { ...prev, [type]: value };
      // Global loading é verdadeiro se qualquer um dos outros for verdadeiro
      newState.global = newState.auth || newState.data || newState.navigation;
      return newState;
    });
  }, []);

  const forceComplete = useCallback(() => {
    console.log('[GLOBAL-LOADING] Forçando finalização de todos os loadings');
    setLoadingState({
      auth: false,
      data: false,
      navigation: false,
      global: false
    });
  }, []);

  const reset = useCallback(() => {
    console.log('[GLOBAL-LOADING] Reset do sistema de loading');
    setLoadingState({
      auth: true,
      data: false,
      navigation: false,
      global: true
    });
  }, []);

  return {
    loadingState,
    setLoading,
    forceComplete,
    reset,
    circuitBreakerActive: false, // Simplificado
    retryCount: 0,
    getLoadingDuration: () => 0,
    isAnyLoading: loadingState.global
  };
};
