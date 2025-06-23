
interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      retryCondition = (error) => this.isRetryableError(error)
    } = options;

    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[RETRY] Tentativa ${attempt}/${maxAttempts}`);
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`[RETRY] Sucesso na tentativa ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        console.warn(`[RETRY] Falha na tentativa ${attempt}:`, error);
        
        // Não tentar novamente se não for um erro que pode ser retry
        if (!retryCondition(error)) {
          console.log('[RETRY] Erro não é retryable, abortando');
          throw error;
        }
        
        // Se foi a última tentativa, lançar o erro
        if (attempt === maxAttempts) {
          console.error(`[RETRY] Todas as ${maxAttempts} tentativas falharam`);
          throw lastError;
        }
        
        // Calcular delay com exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );
        
        console.log(`[RETRY] Aguardando ${delay}ms antes da próxima tentativa`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  private static isRetryableError(error: any): boolean {
    // Erros de rede que podem ser retry
    if (error?.message?.includes('NetworkError')) return true;
    if (error?.message?.includes('fetch')) return true;
    if (error?.message?.includes('timeout')) return true;
    
    // Códigos HTTP que podem ser retry
    if (error?.status >= 500) return true;
    if (error?.status === 429) return true; // Rate limit
    if (error?.status === 408) return true; // Request timeout
    
    // Erros do Supabase que podem ser retry
    if (error?.message?.includes('connection')) return true;
    if (error?.message?.includes('timeout')) return true;
    
    return false;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Hook para usar retry em componentes React
export const useRetryOperation = () => {
  const retryWithExponentialBackoff = async <T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    return RetryManager.withRetry(operation, options);
  };

  return { retryWithExponentialBackoff };
};
