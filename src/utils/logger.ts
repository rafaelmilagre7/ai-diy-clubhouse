
/**
 * Sistema de logging centralizado com segurança aprimorada
 * Otimizado para não quebrar builds em produção
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  timestamp?: string;
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Função silenciosa para produção
const silentLog = () => {};

class Logger {
  private logLevel: LogLevel = isProduction ? 'error' : 'debug';
  private enableConsole: boolean = isDevelopment;

  private shouldLog(level: LogLevel): boolean {
    if (isProduction) return false; // Nunca logar em produção
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object' || isProduction) {
      return isProduction ? '[REDACTED]' : data;
    }

    const sanitized = { ...data };
    
    // Em produção, redact tudo
    if (isProduction) {
      Object.keys(sanitized).forEach(key => {
        sanitized[key] = '[REDACTED]';
      });
    }

    return sanitized;
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug') || isProduction) return;
    
    try {
      if (this.enableConsole && isDevelopment) {
        const sanitizedContext = context ? this.sanitizeData(context) : {};
        console.debug(`🐛 [DEBUG] ${message}`, sanitizedContext);
      }
    } catch {
      // Falha silenciosamente
    }
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info') || isProduction) return;
    
    try {
      if (this.enableConsole && isDevelopment) {
        const sanitizedContext = context ? this.sanitizeData(context) : {};
        console.info(`ℹ️ [INFO] ${message}`, sanitizedContext);
      }
    } catch {
      // Falha silenciosamente
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn') || isProduction) return;
    
    try {
      if (this.enableConsole && isDevelopment) {
        const sanitizedContext = context ? this.sanitizeData(context) : {};
        console.warn(`⚠️ [WARN] ${message}`, sanitizedContext);
      }
    } catch {
      // Falha silenciosamente
    }
  }

  error(message: string, context?: LogContext) {
    if (isProduction) return; // Nunca logar erros em produção para evitar quebrar build
    
    try {
      if (this.enableConsole && isDevelopment) {
        const sanitizedContext = context ? this.sanitizeData(context) : {};
        console.error(`❌ [ERROR] ${message}`, sanitizedContext);
      }
    } catch {
      // Falha silenciosamente
    }
  }

  // Todos os métodos especiais retornam silenciosamente em produção
  auth(message: string, context?: LogContext) {
    if (isProduction) return;
    this.debug(`🔐 [AUTH] ${message}`, context);
  }

  navigation(message: string, context?: LogContext) {
    if (isProduction) return;
    this.debug(`🧭 [NAV] ${message}`, context);
  }
}

export const logger = new Logger();

// Funções utilitárias que não fazem nada em produção
export const logPerformance = (operation: string, startTime: number) => {
  if (isProduction) return;
  
  try {
    const duration = Date.now() - startTime;
    logger.info(`Performance: ${operation}`, { duration: `${duration}ms` });
  } catch {
    // Falha silenciosamente
  }
};

export const logNetworkError = (operation: string, error: any) => {
  if (isProduction) return;
  
  try {
    logger.error(`Network error in ${operation}`, {
      error: error?.message || 'Unknown error',
      component: 'NETWORK'
    });
  } catch {
    // Falha silenciosamente
  }
};
