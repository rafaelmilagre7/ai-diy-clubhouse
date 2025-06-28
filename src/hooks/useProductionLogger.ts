
import { useCallback } from 'react';

interface ProductionLoggerOptions {
  component?: string;
  category?: string;
}

export const useProductionLogger = (options: ProductionLoggerOptions = {}) => {
  const isDevelopment = import.meta.env.DEV;
  
  const log = useCallback((message: string, data?: any) => {
    if (isDevelopment) {
      const prefix = options.component ? `[${options.component}]` : '';
      const category = options.category ? `(${options.category})` : '';
      console.log(`${prefix}${category} ${message}`, data || '');
    }
  }, [isDevelopment, options.component, options.category]);

  const warn = useCallback((message: string, data?: any) => {
    if (isDevelopment) {
      const prefix = options.component ? `[${options.component}]` : '';
      console.warn(`${prefix} ${message}`, data || '');
    }
  }, [isDevelopment, options.component]);

  const error = useCallback((message: string, data?: any) => {
    // Errors sempre devem aparecer, mesmo em produção
    const prefix = options.component ? `[${options.component}]` : '';
    console.error(`${prefix} ${message}`, data || '');
  }, [options.component]);

  return { log, warn, error, isDevelopment };
};
