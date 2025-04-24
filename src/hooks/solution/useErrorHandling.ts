
import { useState, useMemo, useCallback } from 'react';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

export const useErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);
  const { logError } = useLogging('useErrorHandling');
  
  // Usar useMemo para calcular os tipos de erro apenas quando error mudar
  const { networkError, notFoundError } = useMemo(() => {
    if (!error) {
      return { networkError: false, notFoundError: false };
    }
    
    // Detecção aprimorada de erro de rede
    const isNetworkError = error.message && (
      error.message.includes("fetch") || 
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      navigator.onLine === false ||
      error.message.includes("connection") ||
      error.message.includes("timeout") ||
      error.message.includes("Network request failed")
    );
    
    const isNotFoundError = error.message && (
      error.message.includes("não encontrada") ||
      error.message.includes("not found") ||
      error.message.includes("não encontrado") ||
      error.message.includes("404")
    );
    
    return { 
      networkError: isNetworkError,
      notFoundError: isNotFoundError
    };
  }, [error]);

  // Função para lidar com erros
  const handleError = useCallback((err: any) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    logError('Erro capturado:', errorObj);
    
    // Adicionar diagnóstico contextual
    const diagnostics = {
      online: navigator.onLine,
      timestamp: new Date().toISOString(),
      errorType: err instanceof Error ? err.constructor.name : 'Unknown',
    };
    
    logError('Diagnóstico de erro:', diagnostics);
    setError(errorObj);
    
    // Para erros de rede, exibir toast apenas em produção
    if (networkError && process.env.NODE_ENV === 'production') {
      toast.error("Erro de conexão", {
        description: "Verifique sua conexão com a internet"
      });
    }
    
    return errorObj;
  }, [logError, networkError]);

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    networkError,
    notFoundError,
    handleError,
    clearError,
    setError
  };
};
