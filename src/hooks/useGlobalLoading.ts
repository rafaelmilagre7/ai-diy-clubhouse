
import { useState, useCallback } from 'react';
import { useProductionLogger } from './useProductionLogger';

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
  
  const { log } = useProductionLogger({ component: 'GlobalLoading' });

  const setLoading = useCallback((type: keyof LoadingState, value: boolean) => {
    setLoadingState(prev => {
      const newState = { ...prev, [type]: value };
      newState.global = newState.auth || newState.data || newState.navigation;
      return newState;
    });
  }, []);

  const forceComplete = useCallback(() => {
    log('Finalizando todos os loadings');
    setLoadingState({
      auth: false,
      data: false,
      navigation: false,
      global: false
    });
  }, [log]);

  const reset = useCallback(() => {
    log('Reset do sistema de loading');
    setLoadingState({
      auth: false,
      data: false,
      navigation: false,
      global: false
    });
  }, [log]);

  return {
    loadingState,
    setLoading,
    forceComplete,
    reset,
    isAnyLoading: loadingState.global
  };
};
