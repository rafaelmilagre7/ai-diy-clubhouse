
/**
 * Sistema de logging centralizado com segurança aprimorada
 * Otimizado para não quebrar builds em produção
 */

import { maskEmailsInText, safeLog } from './emailMasking';

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
    // Em produção, apenas logs de erro críticos são permitidos
    if (isProduction && level !== 'error') return false;
    
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
      return isProduction ? '[REDACTED]' : maskEmailsInText(data);
    }

    const sanitized = { ...data };
    
    // Em produção, redact tudo
    if (isProduction) {
      Object.keys(sanitized).forEach(key => {
        sanitized[key] = '[REDACTED]';
      });
    } else {
      // Em desenvolvimento, mascarar emails
      Object.keys(sanitized).forEach(key => {
        sanitized[key] = maskEmailsInText(sanitized[key]);
      });
    }

    return sanitized;
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug') || isProduction) return;
    
    try {
      if (this.enableConsole && isDevelopment) {
        const sanitizedContext = context ? this.sanitizeData(context) : {};
        safeLog('log', `🐛 [DEBUG] ${message}`, sanitizedContext);
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
        safeLog('info', `ℹ️ [INFO] ${message}`, sanitizedContext);
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
        safeLog('warn', `⚠️ [WARN] ${message}`, sanitizedContext);
      }
    } catch {
      // Falha silenciosamente
    }
  }

  error(message: string, context?: LogContext) {
    try {
      if (isDevelopment || this.shouldLog('error')) {
        const prefix = isProduction ? '[CRITICAL]' : '❌ [ERROR]';
        const sanitizedContext = this.sanitizeData(context);
        
        if (isDevelopment) {
          safeLog('error', `${prefix} ${message}`, sanitizedContext);
        } else {
          // Em produção, usar formato minimalista para erros críticos
          console.log(`${prefix} ${maskEmailsInText(message)}`);
        }
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
  try {
    // Log crítico permitido em produção para debugging
    logger.error(`Network error in ${operation}`, {
      error: error?.message || 'Unknown error',
      component: 'NETWORK'
    });
  } catch {
    // Falha silenciosamente
  }
};
