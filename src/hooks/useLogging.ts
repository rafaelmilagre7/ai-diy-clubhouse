
import { useCallback } from 'react';

export const useLogging = () => {
  const log = useCallback((message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] ${message}`, data);
  }, []);

  const logError = useCallback((message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
  }, []);

  const logWarning = useCallback((message: string, data?: any) => {
    console.warn(`[${new Date().toISOString()}] WARNING: ${message}`, data);
  }, []);

  return { log, logError, logWarning };
};

// Simple provider component that doesn't do anything special
export const LoggingProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
