
import { useCallback } from 'react';

export const useLogging = () => {
  const log = useCallback((message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] ${message}`, data);
  }, []);

  return { log };
};
