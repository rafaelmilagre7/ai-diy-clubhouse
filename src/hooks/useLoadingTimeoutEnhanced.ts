
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import AuthManager from '@/services/AuthManager';

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

  const retry = useCallback(() => {
    logger.info('[LOADING-TIMEOUT-ENHANCED] 🔄 Retry iniciado', {
      context,
      action: 'retry'
    });
    
    setHasTimedOut(false);
    
    // Forçar reinicialização do AuthManager
    const authManager = AuthManager.getInstance();
    if (!authManager.isInitialized) {
      authManager.initialize().catch(error => {
        logger.error('[LOADING-TIMEOUT-ENHANCED] ❌ Erro no retry', error);
      });
    }
  }, [context]);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => {
      logger.warn('[LOADING-TIMEOUT-ENHANCED] ⏰ Timeout atingido', {
        context,
        timeoutMs,
        action: 'timeout_reached'
      });
      
      setHasTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => clearTimeout(timeout);
  }, [isLoading, timeoutMs, context, onTimeout]);

  return { hasTimedOut, retry };
};
