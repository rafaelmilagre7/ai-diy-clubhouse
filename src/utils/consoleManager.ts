/**
 * Gerenciador de console para controlar logs em produção e debug
 */

class ConsoleManager {
  private isProduction = import.meta.env.PROD;
  private originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  init() {
    if (this.isProduction) {
      // Em produção, reduzir logs desnecessários
      this.setupProductionLogging();
    }
  }

  private setupProductionLogging() {
    // Filtrar logs específicos que não são críticos
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Silenciar erros não críticos conhecidos
      if (this.shouldSilenceError(message)) {
        return;
      }
      
      originalError.apply(console, args);
    };

    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Silenciar warnings não críticos
      if (this.shouldSilenceWarning(message)) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
  }

  private shouldSilenceError(message: string): boolean {
    const silencePatterns = [
      /Link prefetch/, // Erros de prefetch não são críticos
      /storage\/v1/, // Erros de storage conhecidos
      /Failed to fetch/, // Erros de fetch para recursos opcionais
      /NetworkError/ // Erros de rede temporários
    ];

    return silencePatterns.some(pattern => pattern.test(message));
  }

  private shouldSilenceWarning(message: string): boolean {
    const silencePatterns = [
      /resource hints/, // Warnings sobre resource hints
      /preload/, // Warnings sobre preload
      /prefetch/ // Warnings sobre prefetch
    ];

    return silencePatterns.some(pattern => pattern.test(message));
  }

  // Método para logs críticos que sempre devem aparecer
  critical(...args: any[]) {
    this.originalConsole.error('[CRITICAL]', ...args);
  }

  // Método para debug que só aparece em desenvolvimento
  debug(...args: any[]) {
    if (!this.isProduction) {
      this.originalConsole.log('[DEBUG]', ...args);
    }
  }
}

export const consoleManager = new ConsoleManager();