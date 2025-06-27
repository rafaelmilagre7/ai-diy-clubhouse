
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface UseLoadingTimeoutEnhancedProps {
  isLoading: boolean;
  timeoutMs?: number;
  context?: string;
  onTimeout?: () => void;
}

export const useLoadingTimeoutEnhanced = ({
  isLoading,
  timeoutMs = 5000,
  context = 'unknown',
  onTimeout
}: UseLoadingTimeoutEnhancedProps) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      logger.warn(`[LOADING-TIMEOUT-ENHANCED] Timeout atingido para contexto: ${context}`);
      setHasTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs, context, onTimeout]);

  const retry = useCallback(() => {
    logger.info(`[LOADING-TIMEOUT-ENHANCED] Retry solicitado para contexto: ${context}`);
    setHasTimedOut(false);
  }, [context]);

  return {
    hasTimedOut,
    retry
  };
};
