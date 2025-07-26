import { useCallback } from 'react';

/**
 * Hook otimizado para logs que remove logs desnecessários em produção
 * Melhora significativamente a performance
 */
export const useOptimizedLogging = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const log = useCallback((message: string, data?: any) => {
    if (isDevelopment && data) {
      console.log(message, data);
    } else if (isDevelopment) {
      console.log(message);
    }
    // Em produção, não faz nada (otimização)
  }, [isDevelopment]);

  const warn = useCallback((message: string, data?: any) => {
    if (isDevelopment && data) {
      console.warn(message, data);
    } else if (isDevelopment) {
      console.warn(message);
    }
    // Em produção, só logs críticos
  }, [isDevelopment]);

  const error = useCallback((message: string, data?: any) => {
    // Errors sempre são logados
    if (data) {
      console.error(message, data);
    } else {
      console.error(message);
    }
  }, []);

  return { log, warn, error };
};

/**
 * Wrapper para console.log que remove logs em produção automaticamente
 */
export const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Wrapper para console.warn que funciona apenas em desenvolvimento
 */
export const devWarn = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
};