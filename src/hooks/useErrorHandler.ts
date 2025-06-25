
import { useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { ErrorUtils } from '@/utils/errorUtils';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastDuration?: number;
  context?: string;
}

interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  context?: string;
}

export const useErrorHandler = () => {
  const logError = useCallback((error: any, context?: string, details?: any) => {
    const errorInfo: ErrorInfo = {
      message: ErrorUtils.getMessage(error),
      code: error?.code,
      details,
      timestamp: new Date().toISOString(),
      context
    };

    // Log detalhado com o logger seguro
    logger.error(`Error in ${context || 'Unknown'}`, error, ErrorUtils.formatForLog(error, context));
    
    return errorInfo;
  }, []);

  const handleError = useCallback((
    error: any, 
    context?: string, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastDuration = 5000,
      context: optionsContext
    } = options;

    const finalContext = optionsContext || context;
    const errorInfo = logError(error, finalContext, options);

    if (showToast) {
      // Personalizar mensagem baseada no tipo de erro
      let userMessage = 'Ocorreu um erro inesperado';
      
      if (ErrorUtils.isNetworkError(error)) {
        userMessage = 'Problema de conexão. Verifique sua internet.';
      } else if (ErrorUtils.isPermissionError(error)) {
        userMessage = 'Você não tem permissão para esta ação.';
      } else if (ErrorUtils.isValidationError(error)) {
        userMessage = 'Dados inválidos. Verifique os campos obrigatórios.';
      } else if (errorInfo.message && errorInfo.message.length < 100) {
        userMessage = errorInfo.message;
      }

      toast.error(userMessage, {
        duration: toastDuration,
        description: finalContext ? `Contexto: ${finalContext}` : undefined
      });
    }

    return errorInfo;
  }, [logError]);

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error, context, options);
      throw error; // Re-throw para permitir handling específico
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    logError
  };
};
