
import { sanitizeForLogging } from './securityUtils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

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
  private maxBufferSize = 100;
  private flushInterval = 30000; // 30 segundos
  
  constructor() {
    // Flush automático dos logs
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
    
    // Flush antes de sair da página
    window.addEventListener('beforeunload', () => {
      this.flushLogs();
    });
  }
  
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
      message,
      userId: metadata?.userId ? String(metadata.userId).substring(0, 8) + '***' : undefined,
      sessionId: metadata?.sessionId ? String(metadata.sessionId).substring(0, 8) + '***' : undefined,
      action: metadata?.action,
      resource: metadata?.resource,
      metadata: metadata ? sanitizeForLogging(metadata) : undefined,
      securityContext: {
        userAgent: navigator.userAgent.substring(0, 100),
        location: window.location.pathname
      }
    };
  }
  
  debug(message: string, component: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry('debug', message, component, metadata);
      console.debug('🐛 [DEBUG]', entry);
      this.addToBuffer(entry);
    }
  }
  
  info(message: string, component: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, component, metadata);
    console.info('ℹ️ [INFO]', entry);
    this.addToBuffer(entry);
  }
  
  warn(message: string, component: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, component, metadata);
    console.warn('⚠️ [WARN]', entry);
    this.addToBuffer(entry);
  }
  
  error(message: string, component: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, component, metadata);
    console.error('❌ [ERROR]', entry);
    this.addToBuffer(entry);
  }
  
  security(event: SecurityEvent, component: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('security', 
      `[${event.severity.toUpperCase()}] ${event.type}: ${event.description}`, 
      component, 
      { ...metadata, securityEvent: event }
    );
    
    console.warn('🔒 [SECURITY]', entry);
    this.addToBuffer(entry);
    
    // Eventos críticos devem ser enviados imediatamente
    if (event.severity === 'critical') {
      this.flushLogs();
    }
  }
  
  private addToBuffer(entry: SecureLogEntry) {
    this.logBuffer.push(entry);
    
    // Flush se buffer estiver cheio
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }
  }
  
  private async flushLogs() {
    if (this.logBuffer.length === 0) return;
    
    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      // Em produção, enviar para serviço de logging
      if (process.env.NODE_ENV === 'production') {
        // Aqui você pode integrar com serviços como:
        // - Supabase Edge Functions
        // - LogRocket
        // - Sentry
        // - DataDog
        
        // Por enquanto, armazenar localmente para análise
        const existingLogs = JSON.parse(localStorage.getItem('app_security_logs') || '[]');
        const updatedLogs = [...existingLogs, ...logsToFlush].slice(-500); // Manter apenas 500 logs
        localStorage.setItem('app_security_logs', JSON.stringify(updatedLogs));
      }
      
      // Log de desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.group('📋 Secure Logs Flush');
        logsToFlush.forEach(log => {
          console.log(log);
        });
        console.groupEnd();
      }
      
    } catch (error) {
      console.error('Erro ao fazer flush dos logs:', error);
    }
  }
  
  // Método para obter logs para análise
  getStoredLogs(): SecureLogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_security_logs') || '[]');
    } catch {
      return [];
    }
  }
  
  // Método para limpar logs armazenados
  clearStoredLogs() {
    localStorage.removeItem('app_security_logs');
  }
  
  // Método para exportar logs (útil para suporte)
  exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Instância singleton
export const secureLogger = new SecureLogger();

// Helpers para diferentes tipos de eventos de segurança
export const logAuthEvent = (action: string, metadata?: Record<string, any>) => {
  secureLogger.security({
    type: 'auth',
    severity: 'medium',
    description: `Authentication event: ${action}`,
    details: metadata || {}
  }, 'AUTH_SYSTEM', metadata);
};

export const logAccessEvent = (resource: string, action: string, metadata?: Record<string, any>) => {
  secureLogger.security({
    type: 'access',
    severity: 'low',
    description: `Access event: ${action} on ${resource}`,
    details: metadata || {}
  }, 'ACCESS_CONTROL', metadata);
};

export const logDataEvent = (action: string, table?: string, metadata?: Record<string, any>) => {
  secureLogger.security({
    type: 'data',
    severity: 'medium',
    description: `Data event: ${action}${table ? ` on ${table}` : ''}`,
    details: metadata || {}
  }, 'DATA_ACCESS', metadata);
};

export const logCriticalEvent = (description: string, metadata?: Record<string, any>) => {
  secureLogger.security({
    type: 'system',
    severity: 'critical',
    description,
    details: metadata || {}
  }, 'CRITICAL_SYSTEM', metadata);
};
