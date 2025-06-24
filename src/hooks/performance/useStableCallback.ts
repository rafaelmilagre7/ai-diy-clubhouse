
import { useCallback, useRef } from 'react';

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);
  
  // Atualizar a referência sempre que o callback mudar
  callbackRef.current = callback;
  
  // Retornar um callback estável que sempre chama a versão mais recente
  return useCallback(((...args: any[]) => {
    return callbackRef.current(...args);
  }) as T, []);
}
