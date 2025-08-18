
import { useCallback } from 'react';
import { toast } from 'sonner';

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
      message: error instanceof Error ? error.message : String(error),
      code: error?.code,
      details,
      timestamp: new Date().toISOString(),
      context
    };

    // Log detalhado no console para desenvolvimento
    if (import.meta.env.DEV) {
      console.group(`🔴 Error in ${context || 'Unknown'}`);
      console.error('Error:', error);
      console.log('Error Info:', errorInfo);
      console.log('Stack:', error?.stack);
      console.groupEnd();
    }

    // Em produção, você poderia enviar para um serviço de logging
    // como Sentry, LogRocket, etc.
    
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
      
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        userMessage = 'Problema de conexão. Verifique sua internet.';
      } else if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
        userMessage = 'Você não tem permissão para esta ação.';
      } else if (error?.message?.includes('validation') || error?.message?.includes('required')) {
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
