
import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface UseLoadingTimeoutManagerProps {
  isLoading: boolean;
  context: string;
  maxTimeoutMs?: number;
  onForceUnlock?: () => void;
}

export const useLoadingTimeoutManager = ({
  isLoading,
  context,
  maxTimeoutMs = 2000, // 2 segundos máximo
  onForceUnlock
}: UseLoadingTimeoutManagerProps) => {
  const [isForceUnlocked, setIsForceUnlocked] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasBeenForcedRef = useRef(false);

  // Reset quando loading muda para true
  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
      setIsForceUnlocked(false);
      hasBeenForcedRef.current = false;
      
      logger.info(`[TIMEOUT-MANAGER] Iniciando timeout para: ${context} (${maxTimeoutMs}ms)`);
      
      // Configurar timeout forçado
      timeoutRef.current = setTimeout(() => {
        if (!hasBeenForcedRef.current) {
          logger.error(`[TIMEOUT-MANAGER] TIMEOUT FORÇADO para: ${context} - desbloqueando campos`);
          setIsForceUnlocked(true);
          hasBeenForcedRef.current = true;
          
          if (onForceUnlock) {
            onForceUnlock();
          }
        }
      }, maxTimeoutMs);
    }
    
    // Limpar quando parar de carregar
    if (!isLoading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setLoadingStartTime(null);
      
      if (!hasBeenForcedRef.current) {
        logger.info(`[TIMEOUT-MANAGER] Loading concluído naturalmente para: ${context}`);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, context, maxTimeoutMs, onForceUnlock, loadingStartTime]);

  const forceUnlock = useCallback(() => {
    logger.warn(`[TIMEOUT-MANAGER] Forçando desbloqueio manual para: ${context}`);
    setIsForceUnlocked(true);
    hasBeenForcedRef.current = true;
    
    if (onForceUnlock) {
      onForceUnlock();
    }
  }, [context, onForceUnlock]);

  const currentDuration = loadingStartTime ? Date.now() - loadingStartTime : 0;
  const shouldBeUnlocked = isForceUnlocked || !isLoading;

  return {
    shouldBeUnlocked,
    isForceUnlocked,
    currentDuration,
    forceUnlock,
    isLoadingTooLong: currentDuration > maxTimeoutMs * 0.8
  };
};
