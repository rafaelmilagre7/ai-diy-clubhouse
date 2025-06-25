
import { useCallback } from "react";

export const useLogging = () => {
  const log = useCallback((message: string, data?: any) => {
    console.log(`[LOG] ${message}`, data);
  }, []);

  const logError = useCallback((message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }, []);

  const logWarning = useCallback((message: string, data?: any) => {
    console.warn(`[WARNING] ${message}`, data);
  }, []);

  return { log, logError, logWarning };
};
