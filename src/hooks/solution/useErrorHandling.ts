
import { useState, useEffect } from 'react';
import { useLogging } from '@/hooks/useLogging';

export const useErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const { logError } = useLogging('useErrorHandling');

  // Efeito para classificar o tipo de erro
  useEffect(() => {
    if (error) {
      // Verificar se é erro de rede
      if (error.message && (
        error.message.includes("fetch") || 
        error.message.includes("network") ||
        error.message.includes("Failed to fetch")
      )) {
        setNetworkError(true);
        setNotFoundError(false);
      } 
      // Verificar se é erro de "não encontrado"
      else if (error.message && (
        error.message.includes("não encontrada") ||
        error.message.includes("not found") ||
        error.message.includes("não encontrado")
      )) {
        setNetworkError(false);
        setNotFoundError(true);
      } 
      // Outros tipos de erro
      else {
        setNetworkError(false);
        setNotFoundError(false);
      }
    } else {
      // Resetar estados se não houver erro
      setNetworkError(false);
      setNotFoundError(false);
    }
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
