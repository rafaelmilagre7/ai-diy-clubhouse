import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface LoadingConfig {
  minLoadingTime?: number;
  timeout?: number;
  showProgressBar?: boolean;
  retryCount?: number;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  hasTimedOut: boolean;
  retryAttempt: number;
  canRetry: boolean;
  duration: number;
  isSlowLoading: boolean;
  isVerySlowLoading: boolean;
}

interface LoadingActions {
  startLoading: () => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
  retry: () => void;
  reset: () => void;
}

/**
 * Hook consolidado para gerenciar estados de loading
 * Substitui useOptimizedLoading com funcionalidades simplificadas
 */
export const useLoadingState = (config: LoadingConfig = {}): [LoadingState, LoadingActions] => {
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
    canRetry: true,
    duration: 0,
    isSlowLoading: false,
    isVerySlowLoading: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minTimeRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  // Atualizar duração em tempo real
  useEffect(() => {
    if (state.isLoading && startTimeRef.current) {
      durationRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current!;
        setState(prev => ({
          ...prev,
          duration: elapsed,
          isSlowLoading: elapsed > 3000,
          isVerySlowLoading: elapsed > 6000
        }));
      }, 500);
    } else {
      if (durationRef.current) {
        clearInterval(durationRef.current);
        durationRef.current = null;
      }
    }

    return () => {
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, [state.isLoading]);

  const actions = useMemo<LoadingActions>(() => ({
    startLoading: () => {
      startTimeRef.current = Date.now();
      
      setState(prev => ({
        ...prev,
        isLoading: true,
        progress: showProgressBar ? 0 : prev.progress,
        hasTimedOut: false,
        duration: 0,
        isSlowLoading: false,
        isVerySlowLoading: false
      }));

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          hasTimedOut: true,
          canRetry: prev.retryAttempt < retryCount
        }));
      }, timeout);

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

      if (minTimeRef.current) clearTimeout(minTimeRef.current);
      minTimeRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: showProgressBar ? 100 : prev.progress
        }));
      }, remainingTime);

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
          progress: showProgressBar ? 0 : prev.progress,
          duration: 0,
          isSlowLoading: false,
          isVerySlowLoading: false
        };
      });
    },

    reset: () => {
      setState({
        isLoading: false,
        progress: 0,
        hasTimedOut: false,
        retryAttempt: 0,
        canRetry: true,
        duration: 0,
        isSlowLoading: false,
        isVerySlowLoading: false
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (minTimeRef.current) {
        clearTimeout(minTimeRef.current);
        minTimeRef.current = null;
      }
      if (durationRef.current) {
        clearInterval(durationRef.current);
        durationRef.current = null;
      }
    }
  }), [minLoadingTime, timeout, showProgressBar, retryCount]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minTimeRef.current) clearTimeout(minTimeRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  return [state, actions];
};
