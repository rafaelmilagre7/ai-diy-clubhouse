
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToastModern } from './useToastModern';
import { logger } from '@/utils/logger';

interface ErrorRecoveryOptions {
  queryKeys?: string[][]; // Queries para invalidar em caso de erro
  showToast?: boolean;
  customMessage?: string;
  onError?: (error: Error) => void;
  retryFn?: () => Promise<void>;
}

export const useErrorRecovery = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToastModern();

  const handleError = useCallback(async (
    error: unknown,
    context: string,
    options: ErrorRecoveryOptions = {}
  ) => {
    const {
      queryKeys = [],
      showToast = true,
      customMessage,
      onError,
      retryFn
    } = options;

    // Log do erro
    logger.error(`[ERROR-RECOVERY] ${context}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const displayMessage = customMessage || `Erro em ${context}: ${errorMessage}`;

    // Mostrar toast se solicitado
    if (showToast) {
      showError('Erro', displayMessage);
    }

    // Invalidar queries específicas para atualizar dados
    if (queryKeys.length > 0) {
      for (const queryKey of queryKeys) {
        await queryClient.invalidateQueries({ queryKey });
      }
    }

    // Callback personalizado de erro
    if (onError && error instanceof Error) {
      onError(error);
    }

    // Função de retry se fornecida
    if (retryFn) {
      try {
        await retryFn();
      } catch (retryError) {
        logger.error(`[ERROR-RECOVERY] Retry failed for ${context}:`, retryError);
      }
    }

  }, [queryClient]);

  const recoverFromError = useCallback(async (
    queryKeys: string[][] = [],
    context: string = 'operação'
  ) => {
    try {
      // Invalidar queries para refresh de dados
      for (const queryKey of queryKeys) {
        await queryClient.invalidateQueries({ queryKey });
      }
      
      showSuccess('Dados atualizados', `${context} foi atualizada com sucesso`);
      
    } catch (error) {
      logger.error('[ERROR-RECOVERY] Recovery failed:', error);
      showError('Erro na recuperação', 'Não foi possível atualizar os dados');
    }
  }, [queryClient]);

  return {
    handleError,
    recoverFromError
  };
};
