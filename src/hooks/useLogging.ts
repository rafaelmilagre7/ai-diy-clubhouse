
/**
 * Hook para padronizar os logs da aplicação
 */
export function useLogging(moduleName: string = '') {
  const prefix = moduleName ? `[${moduleName}]` : '';
  
  /**
   * Logar informações
   */
  const logInfo = (message: string, data?: Record<string, any>) => {
    console.info(`${prefix} ${message}`, data !== undefined ? data : '');
  };
  
  /**
   * Logar avisos
   */
  const logWarning = (message: string, data?: Record<string, any>) => {
    console.warn(`${prefix} ${message}`, data !== undefined ? data : '');
  };
  
  /**
   * Logar erros
   */
  const logError = (message: string, data?: Record<string, any>) => {
    console.error(`${prefix} ${message}`, data !== undefined ? data : '');
  };
  
  /**
   * Logar eventos de debug
   */
  const logDebug = (message: string, data?: Record<string, any>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`${prefix} ${message}`, data !== undefined ? data : '');
    }
  };
  
  /**
   * Cronometrar operações
   */
  const logTimer = (operationName: string, callback: Function) => {
    const startTime = performance.now();
    try {
      callback();
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      logInfo(`Operação "${operationName}" levou ${duration.toFixed(2)}ms`);
    }
  };
  
  /**
   * Cronometrar operações assíncronas
   */
  const logTimerAsync = async (operationName: string, callback: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      return await callback();
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      logInfo(`Operação assíncrona "${operationName}" levou ${duration.toFixed(2)}ms`);
    }
  };
  
  /**
   * Função de log geral para compatibilidade com código existente
   */
  const log = (message: string, data?: Record<string, any>) => {
    logInfo(message, data);
  };
  
  return {
    logInfo,
    logWarning,
    logError,
    logDebug,
    logTimer,
    logTimerAsync,
    log
  };
}

// Definição do tipo LoggingContextType para compartilhar com o useLogging.tsx
export interface LoggingContextType {
  logInfo: (message: string, data?: Record<string, any>) => void;
  logWarning: (message: string, data?: Record<string, any>) => void;
  logError: (message: string, data?: Record<string, any>) => void;
  logDebug: (message: string, data?: Record<string, any>) => void;
  logTimer: (operationName: string, callback: Function) => void;
  logTimerAsync: (operationName: string, callback: () => Promise<any>) => Promise<any>;
  log: (message: string, data?: Record<string, any>) => void;
}
