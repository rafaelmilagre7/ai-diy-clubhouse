
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000  // 10 segundos
};

export const useSupabaseErrorRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);

  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> => {
    const { maxAttempts, baseDelay, maxDelay } = { ...defaultRetryConfig, ...config };
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error as Error;
        
        console.warn(`Tentativa ${attempt}/${maxAttempts} falhou:`, error);
        
        // Se é a última tentativa, não tentar novamente
        if (attempt === maxAttempts) {
          break;
        }
        
        // Calcular delay com backoff exponencial
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        
        // Adicionar jitter para evitar thundering herd
        const jitteredDelay = delay + Math.random() * 1000;
        
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }
    
    throw lastError!;
  }, []);

  const recoverFromAuthError = useCallback(async () => {
    setIsRecovering(true);
    
    try {
      // Tentar renovar a sessão
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        
        // Se não conseguir renovar, fazer logout e pedir para fazer login novamente
        await supabase.auth.signOut();
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        
        return false;
      }
      
      if (data.session) {
        toast.success('Sessão renovada com sucesso');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro durante recuperação de auth:', error);
      return false;
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const recoverFromDatabaseError = useCallback(async (error: any) => {
    console.log('Tentando recuperar de erro de banco:', error);
    
    // Verificar se é erro de RLS
    if (error.message?.includes('row-level security')) {
      toast.error('Erro de permissão. Verificando autenticação...');
      return await recoverFromAuthError();
    }
    
    // Verificar se é erro de conexão
    if (error.message?.includes('connection') || error.message?.includes('network')) {
      toast.error('Problema de conexão. Tentando reconectar...');
      
      // Tentar uma query simples para testar conectividade
      try {
        await supabase.from('profiles').select('count').limit(1);
        toast.success('Conexão restaurada');
        return true;
      } catch (retryError) {
        console.error('Falha na reconexão:', retryError);
        return false;
      }
    }
    
    return false;
  }, [recoverFromAuthError]);

  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      retryConfig?: Partial<RetryConfig>;
      enableAutoRecovery?: boolean;
    } = {}
  ): Promise<T> => {
    const { retryConfig, enableAutoRecovery = true } = options;
    
    try {
      return await withRetry(operation, retryConfig);
    } catch (error) {
      console.error('Operação falhou após todas as tentativas:', error);
      
      if (enableAutoRecovery) {
        const recovered = await recoverFromDatabaseError(error);
        
        if (recovered) {
          // Tentar a operação uma vez mais após recuperação
          try {
            return await operation();
          } catch (retryError) {
            console.error('Operação falhou mesmo após recuperação:', retryError);
            throw retryError;
          }
        }
      }
      
      throw error;
    }
  }, [withRetry, recoverFromDatabaseError]);

  return {
    withRetry,
    recoverFromAuthError,
    recoverFromDatabaseError,
    executeWithRecovery,
    isRecovering
  };
};
