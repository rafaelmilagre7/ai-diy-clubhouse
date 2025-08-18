
import { sanitizeForLogging } from './securityUtils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

interface SecureLogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
  securityContext?: {
    userAgent: string;
    ip?: string;
    location?: string;
  };
}

interface SecurityEvent {
  type: 'auth' | 'access' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: Record<string, any>;
}

class SecureLogger {
  private logBuffer: SecureLogEntry[] = [];
  
  private createLogEntry(
    level: LogLevel,
    message: string,
    component: string,
    metadata?: Record<string, any>
  ): SecureLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message: isProduction ? '[REDACTED]' : message,
      userId: undefined, // Sempre undefined em produção
      sessionId: undefined, // Sempre undefined em produção
      action: metadata?.action,
      resource: metadata?.resource,
      metadata: isProduction ? undefined : (metadata ? sanitizeForLogging(metadata) : undefined),
      securityContext: {
        userAgent: isProduction ? '[REDACTED]' : navigator.userAgent.substring(0, 100),
        location: isProduction ? '[REDACTED]' : window.location.pathname
      }
    };
  }
  
  debug(message: string, component: string, metadata?: Record<string, any>) {
    if (isProduction) return; // Não logar em produção
    
    try {
      if (isDevelopment) {
        const entry = this.createLogEntry('debug', message, component, metadata);
        console.debug('🐛 [DEBUG]', entry);
      }
    } catch {
      // Falha silenciosamente
    }
  }
  
  info(message: string, component: string, metadata?: Record<string, any>) {
    if (isProduction) return; // Não logar em produção
    
    try {
      if (isDevelopment) {
        const entry = this.createLogEntry('info', message, component, metadata);
        console.info('ℹ️ [INFO]', entry);
      }
    } catch {
      // Falha silenciosamente
    }
  }
  
  warn(message: string, component: string, metadata?: Record<string, any>) {
    if (isProduction) return; // Não logar em produção
    
    try {
      if (isDevelopment) {
        const entry = this.createLogEntry('warn', message, component, metadata);
        console.warn('⚠️ [WARN]', entry);
      }
    } catch {
      // Falha silenciosamente
    }
  }
  
  error(message: string, component: string, metadata?: Record<string, any>) {
    if (isProduction) return; // Não logar em produção
    
    try {
      if (isDevelopment) {
        const entry = this.createLogEntry('error', message, component, metadata);
        console.error('❌ [ERROR]', entry);
      }
    } catch {
      // Falha silenciosamente
    }
  }
  
  security(event: SecurityEvent, component: string, metadata?: Record<string, any>) {
    if (isProduction) return; // Não logar em produção
    
    try {
      if (isDevelopment) {
        const entry = this.createLogEntry('security', 
          `[${event.severity.toUpperCase()}] ${event.type}: ${event.description}`, 
          component, 
          { ...metadata, securityEvent: event }
        );
        
        console.warn('🔒 [SECURITY]', entry);
      }
    } catch {
      // Falha silenciosamente
    }
  }
  
  // Métodos que não fazem nada em produção
  getStoredLogs(): SecureLogEntry[] {
    return isProduction ? [] : [];
  }
  
  clearStoredLogs() {
    // Não faz nada
  }
  
  exportLogs(): string {
    return isProduction ? '[]' : '[]';
  }
}

// Instância singleton
export const secureLogger = new SecureLogger();

// Helpers que não fazem nada em produção
export const logAuthEvent = (action: string, metadata?: Record<string, any>) => {
  if (isProduction) return;
  
  try {
    secureLogger.security({
      type: 'auth',
      severity: 'medium',
      description: `Authentication event: ${action}`,
      details: metadata || {}
    }, 'AUTH_SYSTEM', metadata);
  } catch {
    // Falha silenciosamente
  }
};

export const logAccessEvent = (resource: string, action: string, metadata?: Record<string, any>) => {
  if (isProduction) return;
  
  try {
    secureLogger.security({
      type: 'access',
      severity: 'low',
      description: `Access event: ${action} on ${resource}`,
      details: metadata || {}
    }, 'ACCESS_CONTROL', metadata);
  } catch {
    // Falha silenciosamente
  }
};

export const logDataEvent = (action: string, table?: string, metadata?: Record<string, any>) => {
  if (isProduction) return;
  
  try {
    secureLogger.security({
      type: 'data',
      severity: 'medium',
      description: `Data event: ${action}${table ? ` on ${table}` : ''}`,
      details: metadata || {}
    }, 'DATA_ACCESS', metadata);
  } catch {
    // Falha silenciosamente
  }
};

export const logCriticalEvent = (description: string, metadata?: Record<string, any>) => {
  if (isProduction) return;
  
  try {
    secureLogger.security({
      type: 'system',
      severity: 'critical',
      description,
      details: metadata || {}
    }, 'CRITICAL_SYSTEM', metadata);
  } catch {
    // Falha silenciosamente
  }
};
