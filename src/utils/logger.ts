
import { sanitizeData } from '@/components/security/DataSanitizer';

/**
 * Sistema de logging centralizado, seguro e otimizado.
 * Previne vazamento de dados (data leakage).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

interface LogContext {
  component?: string;
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  private logLevel: LogLevel = isProduction ? 'warn' : 'debug';

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      security: 4,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    // Em produção, não fazemos log de `debug` e `info` no console.
    if (isProduction && (level === 'debug' || level === 'info')) {
      return;
    }

    const sanitizedContext = context ? sanitizeData(context) : {};
    const timestamp = new Date().toISOString();
    
    // Fallback para console.log se o método específico não existir
    const logMethod = console[level] || console.log;

    const levelIcons = {
        debug: '🐛 [DEBUG]',
        info: 'ℹ️ [INFO]',
        warn: '⚠️ [WARN]',
        error: '❌ [ERROR]',
        security: '🔒 [SECURITY]'
    };

    logMethod(`${levelIcons[level]} ${message} @ ${timestamp}`, sanitizedContext);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: any, context?: LogContext) {
      const errorContext = {
          ...context,
          error: error ? { message: error.message, stack: error.stack } : undefined
      };
      this.log('error', message, errorContext);
  }
  
  security(message: string, context?: LogContext) {
      this.log('security', message, context);
  }
}

export const logger = new Logger();

// Helpers para manter compatibilidade com código antigo.
export const logPerformance = (operation: string, startTime: number) => {
  if (isProduction) return;
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, { duration: `${duration}ms` });
};

export const logNetworkError = (operation: string, error: any) => {
    logger.error(`Network error in ${operation}`, error, {
        component: 'NETWORK'
    });
};
