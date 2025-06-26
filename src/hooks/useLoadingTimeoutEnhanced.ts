
import { useState, useEffect, useRef } from 'react';
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
  timeoutMs = 3000, // Reduzido para 3s
  context = 'generic',
  onTimeout
}: UseLoadingTimeoutEnhancedProps) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [isLoadingTooLong, setIsLoadingTooLong] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Integrar com AuthManager para contextos de auth
  const authManager = AuthManager.getInstance();

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setHasTimedOut(false);
      setLoadingProgress(0);
      setIsLoadingTooLong(false);

      // Progress simulation OTIMIZADO
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setLoadingDuration(elapsed);
        
        // Progress mais realista
        const progress = Math.min((elapsed / timeoutMs) * 90, 90);
        setLoadingProgress(progress);
        
        // Warning após 2s
        if (elapsed > 2000 && !isLoadingTooLong) {
          setIsLoadingTooLong(true);
        }
      }, 100);

      // Timeout OTIMIZADO
      timeoutRef.current = window.setTimeout(() => {
        logger.warn('[LOADING-TIMEOUT-ENHANCED] ⏰ Timeout após tempo limite', {
          component: 'useLoadingTimeoutEnhanced',
          action: 'timeout',
          context,
          duration: `${timeoutMs}ms`
        });
        
        setHasTimedOut(true);
        setLoadingProgress(100);
        
        if (onTimeout) {
          onTimeout();
        }
        
        // Para contextos de auth, usar AuthManager
        if (context === 'auth' || context === 'onboarding') {
          if (!authManager.isInitialized()) {
            logger.warn('[LOADING-TIMEOUT-ENHANCED] 🔄 Forçando inicialização AuthManager', {
              component: 'useLoadingTimeoutEnhanced',
              action: 'force_auth_manager_init',
              context
            });
            authManager.initialize();
          }
        }
      }, timeoutMs);
    } else {
      // Cleanup quando para de carregar
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setLoadingProgress(100);
      const finalDuration = Date.now() - startTimeRef.current;
      setLoadingDuration(finalDuration);
      
      logger.info('[LOADING-TIMEOUT-ENHANCED] ✅ Loading concluído', {
        component: 'useLoadingTimeoutEnhanced',
        action: 'loading_complete',
        context,
        duration: `${finalDuration}ms`
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, timeoutMs, context, onTimeout, authManager, isLoadingTooLong]);

  const retry = () => {
    logger.info('[LOADING-TIMEOUT-ENHANCED] 🔄 Retry solicitado', {
      component: 'useLoadingTimeoutEnhanced',
      action: 'retry',
      context
    });
    setHasTimedOut(false);
    setLoadingProgress(0);
    setLoadingDuration(0);
    setIsLoadingTooLong(false);
    startTimeRef.current = Date.now();
    
    // Para contextos de auth, reinicializar AuthManager
    if (context === 'auth' || context === 'onboarding') {
      logger.info('[LOADING-TIMEOUT-ENHANCED] 🔄 Reinicializando AuthManager', {
        component: 'useLoadingTimeoutEnhanced',
        action: 'reinitialize_auth_manager',
        context
      });
      authManager.initialize();
    }
  };

  return {
    hasTimedOut,
    loadingProgress,
    loadingDuration,
    isLoadingTooLong,
    retry
  };
};
