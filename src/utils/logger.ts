
/**
 * Sistema de logging centralizado com segurança aprimorada
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  timestamp?: string;
  [key: string]: any;
}

// Lista de campos sensíveis que devem ser sanitizados
const SENSITIVE_FIELDS = [
  'password', 'token', 'email', 'phone', 'api_key', 'secret', 
  'credit_card', 'ssn', 'personal_id', 'address', 'cpf'
];

class Logger {
  private logLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  private enableConsole: boolean = true;
  private errorCount: Map<string, number> = new Map();
  private readonly MAX_ERRORS_PER_COMPONENT = 5;

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    // Sanitizar campos sensíveis
    SENSITIVE_FIELDS.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitizar IDs de usuário (manter apenas primeiros 8 caracteres)
    if (sanitized.userId && typeof sanitized.userId === 'string') {
      sanitized.userId = sanitized.userId.substring(0, 8) + '...';
    }

    // Sanitizar stack traces em produção
    if (process.env.NODE_ENV === 'production' && sanitized.stack) {
      sanitized.stack = '[STACK_TRACE_HIDDEN]';
    }

    return sanitized;
  }

  private checkErrorLimit(component: string): boolean {
    const count = this.errorCount.get(component) || 0;
    if (count >= this.MAX_ERRORS_PER_COMPONENT) {
      return false; // Não loggar mais erros deste componente
    }
    this.errorCount.set(component, count + 1);
    return true;
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug') || process.env.NODE_ENV === 'production') return;
    
    if (this.enableConsole) {
      const sanitizedContext = context ? this.sanitizeData(context) : {};
      console.debug(`🐛 [DEBUG] ${message}`, sanitizedContext);
    }
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    
    if (this.enableConsole) {
      const sanitizedContext = context ? this.sanitizeData(context) : {};
      console.info(`ℹ️ [INFO] ${message}`, sanitizedContext);
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    
    if (this.enableConsole) {
      const sanitizedContext = context ? this.sanitizeData(context) : {};
      console.warn(`⚠️ [WARN] ${message}`, sanitizedContext);
    }
  }

  error(message: string, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    
    const component = context?.component || 'unknown';
    
    // Rate limiting para erros
    if (!this.checkErrorLimit(component)) {
      return; // Muitos erros deste componente, ignorar
    }
    
    if (this.enableConsole) {
      const sanitizedContext = context ? this.sanitizeData(context) : {};
      console.error(`❌ [ERROR] ${message}`, sanitizedContext);
    }
  }

  // Método seguro para logging de autenticação
  auth(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'production') return;
    
    if (this.enableConsole) {
      const sanitizedContext = context ? this.sanitizeData(context) : {};
      console.log(`🔐 [AUTH] ${message}`, sanitizedContext);
    }
  }

  // Método seguro para logging de navegação
  navigation(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'production') return;
    
    if (this.enableConsole) {
      const sanitizedContext = context ? this.sanitizeData(context) : {};
      console.log(`🧭 [NAV] ${message}`, sanitizedContext);
    }
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  setConsoleEnabled(enabled: boolean) {
    this.enableConsole = enabled;
  }

  // Limpar contadores de erro (chamado periodicamente)
  resetErrorCounts() {
    this.errorCount.clear();
  }
}

export const logger = new Logger();

// Função utilitária para logging de performance
export const logPerformance = (operation: string, startTime: number) => {
  if (process.env.NODE_ENV === 'production') return;
  
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, { duration: `${duration}ms` });
};

// Função utilitária para logging de erros de rede
export const logNetworkError = (operation: string, error: any) => {
  logger.error(`Network error in ${operation}`, {
    error: error?.message || 'Unknown error',
    component: 'NETWORK'
  });
};

// Reset automático de contadores a cada 5 minutos
setInterval(() => {
  logger.resetErrorCounts();
}, 5 * 60 * 1000);
