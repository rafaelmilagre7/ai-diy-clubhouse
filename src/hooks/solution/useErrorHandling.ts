
import { useState, useCallback } from 'react';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

export const useErrorHandling = () => {
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [notFoundError, setNotFoundError] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const { logError } = useLogging('useErrorHandling');

  const handleError = useCallback((error: any) => {
    logError('Erro detectado:', error);
    
    // Limpar estados de erro anteriores
    setNetworkError(false);
    setNotFoundError(false);
    setPermissionError(false);
    
    // Verificar o tipo de erro
    if (!error) return;
    
    const errorMessage = error.message || String(error);
    
    // Verificar erro de rede
    if (
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('network') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('timeout') ||
      error.code === 'NETWORK_ERROR'
    ) {
      setNetworkError(true);
      toast.error('Erro de conexão com o servidor');
      return;
    }
    
    // Verificar erro de recurso não encontrado
    if (
      errorMessage.includes('não encontrada') ||
      errorMessage.includes('not found') ||
      error.code === 'PGRST116' ||
      error.status === 404
    ) {
      setNotFoundError(true);
      toast.error('Solução não encontrada');
      return;
    }
    
    // Verificar erro de permissão
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('access denied') ||
      errorMessage.includes('not allowed') ||
      error.code === 'PGRST301' ||
      error.status === 403
    ) {
      setPermissionError(true);
      toast.error('Você não tem permissão para acessar este recurso');
      return;
    }
    
    // Erro genérico
    toast.error('Ocorreu um erro ao processar sua solicitação');
    
  }, [logError]);

  return {
    networkError,
    notFoundError,
    permissionError,
    handleError
  };
};
