
/**
 * Utilitário centralizado para tratamento de erros
 * Garante consistência no tratamento de diferentes tipos de erro
 */
export class ErrorUtils {
  /**
   * Extrai a mensagem de erro de qualquer tipo de erro
   */
  static getMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      // Error object com message
      if (error.message) {
        return error.message;
      }
      
      // Supabase error format
      if (error.error && error.error.message) {
        return error.error.message;
      }
      
      // Custom error format
      if (error.details) {
        return error.details;
      }
      
      // Fallback para JSON
      try {
        return JSON.stringify(error);
      } catch {
        return 'Erro desconhecido (objeto)';
      }
    }
    
    return 'Erro desconhecido';
  }

  /**
   * Verifica se é um erro de rede/conexão
   */
  static isNetworkError(error: any): boolean {
    const message = this.getMessage(error).toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('connection') ||
           message.includes('timeout');
  }

  /**
   * Verifica se é um erro de permissão
   */
  static isPermissionError(error: any): boolean {
    const message = this.getMessage(error).toLowerCase();
    return message.includes('permission') || 
           message.includes('unauthorized') ||
           message.includes('forbidden') ||
           message.includes('access denied');
  }

  /**
   * Verifica se é um erro de validação
   */
  static isValidationError(error: any): boolean {
    const message = this.getMessage(error).toLowerCase();
    return message.includes('validation') || 
           message.includes('required') ||
           message.includes('invalid') ||
           message.includes('must be');
  }

  /**
   * Formata erro para log estruturado
   */
  static formatForLog(error: any, context?: string): Record<string, any> {
    return {
      message: this.getMessage(error),
      context,
      originalError: error,
      errorType: typeof error,
      isNetworkError: this.isNetworkError(error),
      isPermissionError: this.isPermissionError(error),
      isValidationError: this.isValidationError(error),
      timestamp: new Date().toISOString()
    };
  }
}
