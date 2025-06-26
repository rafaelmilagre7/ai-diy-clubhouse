
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

  private log(level: LogLevel, message: string | LogContext, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    // Em produção, não fazemos log de `debug` e `info` no console.
    if (isProduction && (level === 'debug' || level === 'info')) {
      return;
    }

    let logMessage: string;
    let logContext: LogContext = {};

    // Se message é um objeto, extrair a mensagem e contexto
    if (typeof message === 'object' && message !== null) {
      logMessage = message.message || 'Log estruturado';
      logContext = { ...message };
      delete logContext.message; // Remove message do contexto para evitar duplicação
    } else {
      logMessage = message as string;
    }

    // Combinar contextos se ambos existirem
    const finalContext = context ? { ...logContext, ...context } : logContext;
    const sanitizedContext = Object.keys(finalContext).length > 0 ? sanitizeData(finalContext) : {};
    
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

    if (Object.keys(sanitizedContext).length > 0) {
      logMethod(`${levelIcons[level]} ${logMessage} @ ${timestamp}`, sanitizedContext);
    } else {
      logMethod(`${levelIcons[level]} ${logMessage} @ ${timestamp}`);
    }
  }

  debug(message: string | LogContext, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string | LogContext, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string | LogContext, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string | LogContext, error?: any, context?: LogContext) {
      const errorContext = {
          ...context,
          error: error ? { message: error.message, stack: error.stack } : undefined
      };
      this.log('error', message, errorContext);
  }
  
  security(message: string | LogContext, context?: LogContext) {
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
