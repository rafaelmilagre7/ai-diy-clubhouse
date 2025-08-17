import { useCallback } from 'react';
import { maskEmailsInText, safeLog } from '@/utils/emailMasking';

/**
 * Hook otimizado para logs que remove logs desnecessários em produção
 * Melhora significativamente a performance
 */
export const useOptimizedLogging = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const log = useCallback((message: string, data?: any) => {
    if (isDevelopment) {
      safeLog('log', message, data);
    }
    // Em produção, não faz nada (otimização)
  }, [isDevelopment]);

  const warn = useCallback((message: string, data?: any) => {
    if (isDevelopment) {
      safeLog('warn', message, data);
    }
    // Em produção, só logs críticos
  }, [isDevelopment]);

  const error = useCallback((message: string, data?: any) => {
    // Errors sempre são logados com mascaramento
    safeLog('error', message, data);
  }, []);

  return { log, warn, error };
};

/**
 * Wrapper para console.log que remove logs em produção automaticamente
 */
export const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    safeLog('log', message, data);
  }
};

/**
 * Wrapper para console.warn que funciona apenas em desenvolvimento
 */
export const devWarn = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    safeLog('warn', message, data);
  }
};