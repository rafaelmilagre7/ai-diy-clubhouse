
/**
 * Sistema de logging centralizado com controle de níveis
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  timestamp?: string;
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel = 'debug'; // Temporariamente debug para diagnóstico
  private enableConsole: boolean = true;

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return;
    
    if (this.enableConsole) {
      console.debug(`🐛 [DEBUG] ${message}`, context || '');
    }
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    
    if (this.enableConsole) {
      console.info(`ℹ️ [INFO] ${message}`, context || '');
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    
    if (this.enableConsole) {
      console.warn(`⚠️ [WARN] ${message}`, context || '');
    }
  }

  error(message: string, context?: LogContext | Error) {
    if (!this.shouldLog('error')) return;
    
    if (this.enableConsole) {
      console.error(`❌ [ERROR] ${message}`, context || '');
    }
  }

  // Método para logging de autenticação específico
  auth(message: string, context?: LogContext) {
    if (this.enableConsole) {
      console.log(`🔐 [AUTH] ${message}`, context || '');
    }
  }

  // Método para logging de navegação específico
  navigation(message: string, context?: LogContext) {
    if (this.enableConsole) {
      console.log(`🧭 [NAV] ${message}`, context || '');
    }
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  setConsoleEnabled(enabled: boolean) {
    this.enableConsole = enabled;
  }
}

export const logger = new Logger();

// Função utilitária para logging de performance
export const logPerformance = (operation: string, startTime: number) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, { duration: `${duration}ms` });
};

// Função utilitária para logging de erros de rede
export const logNetworkError = (operation: string, error: any) => {
  logger.error(`Network error in ${operation}`, {
    error: error.message || error,
    stack: error.stack
  });
};
