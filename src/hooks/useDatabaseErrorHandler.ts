import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackData?: any;
  retryEnabled?: boolean;
  retryAttempts?: number;
}

interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
  isRetryable: boolean;
}

export const useDatabaseErrorHandler = () => {
  const { toast } = useToast();
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});

  const parseError = useCallback((error: any): DatabaseError => {
    if (!error) {
      return {
        code: 'UNKNOWN',
        message: 'Erro desconhecido',
        isRetryable: false
      };
    }

    // PostgrestError do Supabase
    if (error.code && error.message) {
      const postgrestError = error as PostgrestError;
      return {
        code: postgrestError.code,
        message: postgrestError.message,
        details: postgrestError.details,
        hint: postgrestError.hint,
        isRetryable: isRetryableError(postgrestError.code)
      };
    }

    // Erro genérico
    return {
      code: 'GENERIC_ERROR',
      message: error.message || String(error),
      isRetryable: isRetryableError(error.message)
    };
  }, []);

  const isRetryableError = useCallback((code: string): boolean => {
    const retryableCodes = [
      'PGRST116', // Row not found (pode ser temporário)
      '42P01',    // Table doesn't exist (pode ser view em criação)
      '53300',    // Too many connections
      'NETWORK_ERROR',
      'TIMEOUT',
      'CONNECTION_ERROR'
    ];

    return retryableCodes.includes(code) || 
           (typeof code === 'string' && 
            (code.includes('timeout') || 
             code.includes('network') || 
             code.includes('connection')));
  }, []);

  const getFallbackMessage = useCallback((operation: string): string => {
    const fallbackMessages: Record<string, string> = {
      'admin_analytics_overview': 'Dados de analytics indisponíveis temporariamente',
      'profiles': 'Informações do perfil não puderam ser carregadas',
      'learning_progress': 'Progresso de aprendizado indisponível',
      'implementation_checkpoints': 'Dados de implementação não encontrados',
      'analytics': 'Dados analíticos indisponíveis',
      'solutions': 'Soluções não puderam ser carregadas'
    };

    return fallbackMessages[operation] || 'Dados indisponíveis temporariamente';
  }, []);

  const handleError = useCallback(async <T>(
    operation: string,
    error: any,
    options: ErrorHandlerOptions = {}
  ): Promise<{ data: T | null; error: DatabaseError; shouldRetry: boolean }> => {
    const {
      showToast = true,
      logError = true,
      fallbackData = null,
      retryEnabled = true,
      retryAttempts: maxRetries = 3
    } = options;

    const parsedError = parseError(error);
    const currentAttempts = retryAttempts[operation] || 0;
    const shouldRetry = retryEnabled && 
                       parsedError.isRetryable && 
                       currentAttempts < maxRetries;

    if (logError) {
      console.error(`❌ Erro na operação ${operation}:`, {
        code: parsedError.code,
        message: parsedError.message,
        details: parsedError.details,
        attempts: currentAttempts,
        shouldRetry
      });
    }

    if (showToast) {
      const isTemporary = parsedError.isRetryable;
      const fallbackMessage = getFallbackMessage(operation);
      
      toast({
        title: isTemporary ? "Problema Temporário" : "Erro no Sistema",
        description: isTemporary ? 
          `${fallbackMessage}. ${shouldRetry ? 'Tentando novamente...' : ''}` :
          parsedError.message,
        variant: isTemporary ? "default" : "destructive"
      });
    }

    // Atualizar contadores de retry
    if (shouldRetry) {
      setRetryAttempts(prev => ({
        ...prev,
        [operation]: currentAttempts + 1
      }));
    } else {
      // Limpar contador se não vai tentar novamente
      setRetryAttempts(prev => {
        const { [operation]: _, ...rest } = prev;
        return rest;
      });
    }

    return {
      data: fallbackData,
      error: parsedError,
      shouldRetry
    };
  }, [parseError, retryAttempts, toast, getFallbackMessage]);

  const resetRetryCount = useCallback((operation: string) => {
    setRetryAttempts(prev => {
      const { [operation]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: string,
    asyncFunction: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    const maxRetries = options.retryAttempts || 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFunction();
        // Sucesso - limpar contador de retry
        resetRetryCount(operation);
        return result;
      } catch (error) {
        const { data, shouldRetry } = await handleError<T>(
          operation, 
          error, 
          { ...options, retryAttempts: maxRetries }
        );

        if (!shouldRetry || attempt === maxRetries) {
          return data;
        }

        // Aguardar antes de tentar novamente (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }, [handleError, resetRetryCount]);

  return {
    handleError,
    executeWithErrorHandling,
    resetRetryCount,
    parseError
  };
};