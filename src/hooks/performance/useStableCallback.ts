
import { useCallback, useRef } from 'react';

// Hook para criar callbacks estáveis que não causam re-renders
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef<T>(callback);
  
  // Atualizar a referência sem quebrar a estabilidade
  callbackRef.current = callback;
  
  // Retornar callback estável
  const stableCallback = useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
  
  return stableCallback;
};
