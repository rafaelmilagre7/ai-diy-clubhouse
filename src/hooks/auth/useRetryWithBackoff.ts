
import { useState, useCallback, useRef } from 'react';

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

interface RetryState {
  attempts: number;
  isRetrying: boolean;
  lastError: Error | null;
}

export const useRetryWithBackoff = (config: RetryConfig = {}) => {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = config;

  const [state, setState] = useState<RetryState>({
    attempts: 0,
    isRetrying: false,
    lastError: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = useCallback((attempt: number) => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    return Math.min(delay, maxDelay);
  }, [initialDelay, backoffFactor, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> => {
    setState(prev => ({ ...prev, isRetrying: true, attempts: 0 }));
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt + 1}/${maxAttempts} para: ${context}`);
        
        const result = await operation();
        
        setState({
          attempts: attempt + 1,
          isRetrying: false,
          lastError: null
        });
        
        console.log(`✅ Sucesso na tentativa ${attempt + 1} para: ${context}`);
        return result;
        
      } catch (error) {
        const err = error as Error;
        console.error(`❌ Falha na tentativa ${attempt + 1}/${maxAttempts} para: ${context}`, err.message);
        
        setState(prev => ({
          ...prev,
          attempts: attempt + 1,
          lastError: err
        }));

        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < maxAttempts - 1) {
          const delay = calculateDelay(attempt);
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    setState(prev => ({ ...prev, isRetrying: false }));
    throw new Error(`Operação ${context} falhou após ${maxAttempts} tentativas: ${state.lastError?.message}`);
  }, [maxAttempts, calculateDelay, state.lastError]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      attempts: 0,
      isRetrying: false,
      lastError: null
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...state
  };
};
