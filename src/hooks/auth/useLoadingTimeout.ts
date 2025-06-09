
import { useEffect, useRef, useState } from 'react';

interface UseLoadingTimeoutProps {
  isLoading: boolean;
  timeoutMs?: number;
  onTimeout?: () => void;
}

export const useLoadingTimeout = ({ 
  isLoading, 
  timeoutMs = 10000, 
  onTimeout 
}: UseLoadingTimeoutProps) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const loadingStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Marcar início do loading
      if (!loadingStartTime.current) {
        loadingStartTime.current = Date.now();
      }

      // Configurar timeout
      timeoutRef.current = window.setTimeout(() => {
        console.warn(`⚠️ [LOADING TIMEOUT] Timeout de ${timeoutMs}ms atingido`);
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeoutMs);
    } else {
      // Limpar timeout quando parar de carregar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      loadingStartTime.current = null;
      setHasTimedOut(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, timeoutMs, onTimeout]);

  const loadingDuration = loadingStartTime.current 
    ? Date.now() - loadingStartTime.current 
    : 0;

  return {
    hasTimedOut,
    loadingDuration,
    isLoadingTooLong: loadingDuration > timeoutMs * 0.8 // 80% do timeout
  };
};
