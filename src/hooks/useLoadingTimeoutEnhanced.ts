
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
  timeoutMs = 3000,
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
        logger.warn('[LOADING-TIMEOUT] ⏰ Timeout atingido:', {
          context,
          duration: `${timeoutMs}ms`,
          component: 'useLoadingTimeoutEnhanced'
        });
        
        setHasTimedOut(true);
        setLoadingProgress(100);
        
        if (onTimeout) {
          onTimeout();
        }
        
        // Para contextos de auth, usar AuthManager
        if (context === 'auth' || context === 'onboarding' || context === 'root_redirect') {
          if (!authManager.isInitialized) {
            logger.warn('[LOADING-TIMEOUT] 🔄 Forçando inicialização AuthManager:', {
              context,
              component: 'useLoadingTimeoutEnhanced'
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
      
      logger.info('[LOADING-TIMEOUT] ✅ Loading concluído:', {
        context,
        duration: `${finalDuration}ms`,
        component: 'useLoadingTimeoutEnhanced'
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, timeoutMs, context, onTimeout, authManager, isLoadingTooLong]);

  const retry = () => {
    logger.info('[LOADING-TIMEOUT] 🔄 Retry solicitado:', {
      context,
      component: 'useLoadingTimeoutEnhanced'
    });
    setHasTimedOut(false);
    setLoadingProgress(0);
    setLoadingDuration(0);
    setIsLoadingTooLong(false);
    startTimeRef.current = Date.now();
    
    // Para contextos de auth, reinicializar AuthManager
    if (context === 'auth' || context === 'onboarding' || context === 'root_redirect') {
      logger.info('[LOADING-TIMEOUT] 🚀 Reinicializando AuthManager:', {
        context,
        component: 'useLoadingTimeoutEnhanced'
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
