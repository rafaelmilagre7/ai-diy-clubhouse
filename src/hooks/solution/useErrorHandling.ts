
import { useState, useMemo } from 'react';
import { useLogging } from '@/hooks/useLogging';

export const useErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);
  const { logError } = useLogging('useErrorHandling');
  
  // Usar useMemo para calcular os tipos de erro apenas quando error mudar
  const { networkError, notFoundError } = useMemo(() => {
    if (!error) {
      return { networkError: false, notFoundError: false };
    }
    
    const isNetworkError = error.message && (
      error.message.includes("fetch") || 
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
    
    const isNotFoundError = error.message && (
      error.message.includes("não encontrada") ||
      error.message.includes("not found") ||
      error.message.includes("não encontrado")
    );
    
    return { 
      networkError: isNetworkError,
      notFoundError: isNotFoundError
    };
  }, [error]);

  // Função para lidar com erros
  const handleError = (err: any) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    logError('Erro capturado:', errorObj);
    setError(errorObj);
    return errorObj;
  };

  return {
    error,
    networkError,
    notFoundError,
    handleError,
    setError
  };
};
