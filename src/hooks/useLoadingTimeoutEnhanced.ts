
import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface UseLoadingTimeoutEnhancedProps {
  isLoading: boolean;
  timeoutMs?: number;
  onTimeout?: () => void;
  context?: string;
}

export const useLoadingTimeoutEnhanced = ({ 
  isLoading, 
  timeoutMs = 15000, // 15 segundos 
  onTimeout,
  context = 'unknown'
}: UseLoadingTimeoutEnhancedProps) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);
  const loadingStartTime = useRef<number | null>(null);

  const forceTimeout = useCallback(() => {
    logger.error(`[TIMEOUT-ENHANCED] Forçando timeout para contexto: ${context}`);
    setHasTimedOut(true);
    if (onTimeout) {
      onTimeout();
    }
  }, [onTimeout, context]);

  useEffect(() => {
    if (isLoading && !hasTimedOut) {
      // Marcar início do loading
      if (!loadingStartTime.current) {
        loadingStartTime.current = Date.now();
        logger.info(`[TIMEOUT-ENHANCED] Iniciando loading para: ${context}`);
      }

      // Simular progresso visual
      progressRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 5, 85); // Máximo 85%
          return newProgress;
        });
      }, 500);

      // Configurar timeout
      timeoutRef.current = window.setTimeout(() => {
        logger.warn(`[TIMEOUT-ENHANCED] Timeout de ${timeoutMs}ms atingido para: ${context}`);
        forceTimeout();
      }, timeoutMs);
    } else {
      // Limpar timers quando parar de carregar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
      
      if (!isLoading && !hasTimedOut) {
        setLoadingProgress(100);
        loadingStartTime.current = null;
        logger.info(`[TIMEOUT-ENHANCED] Loading concluído para: ${context}`);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isLoading, timeoutMs, forceTimeout, context, hasTimedOut]);

  const loadingDuration = loadingStartTime.current 
    ? Date.now() - loadingStartTime.current 
    : 0;

  const retry = useCallback(() => {
    logger.info(`[TIMEOUT-ENHANCED] Tentativa de retry para: ${context}`);
    setHasTimedOut(false);
    setLoadingProgress(0);
    loadingStartTime.current = null;
  }, [context]);

  return {
    hasTimedOut,
    loadingDuration,
    loadingProgress,
    isLoadingTooLong: loadingDuration > timeoutMs * 0.7, // 70% do timeout
    retry,
    forceTimeout
  };
};
