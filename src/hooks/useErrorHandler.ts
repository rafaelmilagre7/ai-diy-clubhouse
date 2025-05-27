
import { useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
  logLevel?: 'error' | 'warn' | 'info';
  redirectOnError?: string;
  retryCallback?: () => void;
}

interface UseErrorHandlerReturn {
  handleError: (error: Error | unknown, context?: string, options?: ErrorHandlerOptions) => void;
  handleAsyncError: (promise: Promise<any>, context?: string, options?: ErrorHandlerOptions) => Promise<any>;
  clearErrors: () => void;
}

/**
 * Hook para gerenciar erros de forma consistente na aplicação
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((
    error: Error | unknown, 
    context = 'Unknown context',
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastMessage,
      logLevel = 'error',
      redirectOnError,
      retryCallback
    } = options;

    // Normalizar o erro
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    
    // Log do erro
    if (logLevel === 'error') {
      logger.error(`Erro capturado em ${context}`, {
        message: normalizedError.message,
        stack: normalizedError.stack,
        context,
        timestamp: new Date().toISOString()
      });
    } else if (logLevel === 'warn') {
      logger.warn(`Aviso em ${context}`, {
        message: normalizedError.message,
        context
      });
    } else {
      logger.info(`Informação em ${context}`, {
        message: normalizedError.message,
        context
      });
    }

    // Mostrar toast se habilitado
    if (showToast) {
      const message = toastMessage || getErrorMessage(normalizedError);
      
      if (logLevel === 'error') {
        toast.error(message, {
          action: retryCallback ? {
            label: 'Tentar novamente',
            onClick: retryCallback
          } : undefined
        });
      } else if (logLevel === 'warn') {
        toast.warning(message);
      } else {
        toast.info(message);
      }
    }

    // Redirecionar se especificado
    if (redirectOnError) {
      setTimeout(() => {
        window.location.href = redirectOnError;
      }, 1000);
    }

    return normalizedError;
  }, []);

  const handleAsyncError = useCallback(async (
    promise: Promise<any>, 
    context = 'Async operation',
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, context, options);
      throw error; // Re-throw para que o caller possa decidir como proceder
    }
  }, [handleError]);

  const clearErrors = useCallback(() => {
    // Limpar erros persistentes ou estados de erro se necessário
    // Por exemplo, limpar localStorage de erros, resetar contextos, etc.
    toast.dismiss();
  }, []);

  return {
    handleError,
    handleAsyncError,
    clearErrors
  };
};

/**
 * Obter mensagem de erro amigável baseada no tipo de erro
 */
function getErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Problema de conexão. Verifique sua internet.';
  }
  
  if (message.includes('auth') || message.includes('unauthorized')) {
    return 'Erro de autenticação. Faça login novamente.';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'Recurso não encontrado.';
  }
  
  if (message.includes('timeout')) {
    return 'Operação demorou muito para responder.';
  }
  
  if (message.includes('permission') || message.includes('forbidden')) {
    return 'Você não tem permissão para esta ação.';
  }
  
  // Mensagem genérica para outros erros
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export default useErrorHandler;
