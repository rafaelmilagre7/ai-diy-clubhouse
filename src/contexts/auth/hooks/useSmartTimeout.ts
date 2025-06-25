
import { useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface SmartTimeoutConfig {
  context: string;
  authTimeout?: number;
  profileTimeout?: number;
  onboardingTimeout?: number;
}

interface SmartTimeoutReturn {
  startTimeout: (type: 'auth' | 'profile' | 'onboarding', callback: () => void) => number;
  clearTimeout: (timeoutId: number | null) => void;
}

export const useSmartTimeout = (config: SmartTimeoutConfig): SmartTimeoutReturn => {
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  
  const startTimeout = useCallback((type: 'auth' | 'profile' | 'onboarding', callback: () => void): number => {
    const timeouts = {
      auth: config.authTimeout || 4000,
      profile: config.profileTimeout || 3000,
      onboarding: config.onboardingTimeout || 2000
    };
    
    const delay = timeouts[type];
    const timeoutId = Date.now();
    
    const timeout = setTimeout(() => {
      logger.warn(`[SMART-TIMEOUT] ${config.context} - ${type} timeout (${delay}ms)`);
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    
    timeoutsRef.current.set(timeoutId, timeout);
    
    logger.info(`[SMART-TIMEOUT] ${config.context} - ${type} iniciado (${delay}ms)`, { timeoutId });
    return timeoutId;
  }, [config]);

  const clearTimeout = useCallback((timeoutId: number | null) => {
    if (!timeoutId || !timeoutsRef.current.has(timeoutId)) return;
    
    const timeout = timeoutsRef.current.get(timeoutId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(timeoutId);
      logger.info(`[SMART-TIMEOUT] ${config.context} - timeout limpo`, { timeoutId });
    }
  }, [config.context]);

  return { startTimeout, clearTimeout };
};
