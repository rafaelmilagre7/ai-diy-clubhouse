
import { useState, useCallback } from 'react';

interface LoadingState {
  auth: boolean;
  data: boolean;
  navigation: boolean;
  global: boolean;
}

export const useGlobalLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    auth: false,
    data: false,
    navigation: false,
    global: false
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
    console.log('[GLOBAL-LOADING] Finalizando todos os loadings');
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
      auth: false,
      data: false,
      navigation: false,
      global: false
    });
  }, []);

  return {
    loadingState,
    setLoading,
    forceComplete,
    reset,
    isAnyLoading: loadingState.global
  };
};
