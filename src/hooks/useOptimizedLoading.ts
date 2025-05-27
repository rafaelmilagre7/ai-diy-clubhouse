
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface LoadingConfig {
  minLoadingTime?: number; // Tempo mínimo de loading em ms
  timeout?: number; // Timeout para loading em ms
  showProgressBar?: boolean;
  retryCount?: number;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  hasTimedOut: boolean;
  retryAttempt: number;
  canRetry: boolean;
}

interface LoadingActions {
  startLoading: () => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
  retry: () => void;
  reset: () => void;
}

/**
 * Hook otimizado para gerenciar estados de loading com UX melhorada
 */
export const useOptimizedLoading = (config: LoadingConfig = {}): [LoadingState, LoadingActions] => {
  const {
    minLoadingTime = 500,
    timeout = 30000,
    showProgressBar = false,
    retryCount = 3
  } = config;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    hasTimedOut: false,
    retryAttempt: 0,
    canRetry: true
  });

  const timeoutRef = useRef<number | null>(null);
  const minTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Memoizar ações para evitar re-criações
  const actions = useMemo<LoadingActions>(() => ({
    startLoading: () => {
      startTimeRef.current = Date.now();
      
      setState(prev => ({
        ...prev,
        isLoading: true,
        progress: showProgressBar ? 0 : prev.progress,
        hasTimedOut: false
      }));

      // Configurar timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setState(prev => ({
          ...prev,
          hasTimedOut: true,
          canRetry: prev.retryAttempt < retryCount
        }));
      }, timeout);

      // Simular progresso gradual se habilitado
      if (showProgressBar) {
        const progressInterval = setInterval(() => {
          setState(prev => {
            if (!prev.isLoading || prev.progress >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return {
              ...prev,
              progress: Math.min(90, prev.progress + Math.random() * 15)
            };
          });
        }, 200);
      }
    },

    stopLoading: () => {
      const elapsedTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Garantir tempo mínimo de loading para evitar flashes
      if (minTimeRef.current) clearTimeout(minTimeRef.current);
      minTimeRef.current = window.setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: showProgressBar ? 100 : prev.progress
        }));
      }, remainingTime);

      // Limpar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },

    setProgress: (progress: number) => {
      if (showProgressBar) {
        setState(prev => ({
          ...prev,
          progress: Math.min(100, Math.max(0, progress))
        }));
      }
    },

    retry: () => {
      setState(prev => {
        if (prev.retryAttempt >= retryCount) {
          return { ...prev, canRetry: false };
        }
        
        return {
          ...prev,
          retryAttempt: prev.retryAttempt + 1,
          hasTimedOut: false,
          isLoading: true,
          progress: showProgressBar ? 0 : prev.progress
        };
      });
    },

    reset: () => {
      setState({
        isLoading: false,
        progress: 0,
        hasTimedOut: false,
        retryAttempt: 0,
        canRetry: true
      });
      
      // Limpar timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (minTimeRef.current) {
        clearTimeout(minTimeRef.current);
        minTimeRef.current = null;
      }
    }
  }), [minLoadingTime, timeout, showProgressBar, retryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minTimeRef.current) clearTimeout(minTimeRef.current);
    };
  }, []);

  return [state, actions];
};

export default useOptimizedLoading;
