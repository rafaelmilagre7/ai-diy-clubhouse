
import { useState } from 'react';
import { useLogging } from '@/hooks/useLogging';

export const useErrorHandling = () => {
  const [networkError, setNetworkError] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const { logError } = useLogging('useErrorHandling');

  const handleError = (error: any) => {
    if (error.message?.includes('não encontrada')) {
      setNotFoundError(true);
      setNetworkError(false);
    } else if (
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('timeout')
    ) {
      setNetworkError(true);
      setNotFoundError(false);
    } else {
      logError('Erro não categorizado:', error);
    }
  };

  return {
    networkError,
    notFoundError,
    setNetworkError,
    setNotFoundError,
    handleError
  };
};
