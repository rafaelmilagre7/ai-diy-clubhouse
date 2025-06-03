
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical' | 'performance';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  userId?: string;
}

interface LoggerConfig {
  maxBufferSize?: number;
  enableConsole?: boolean;
  enableStorage?: boolean;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private config: LoggerConfig = {
    maxBufferSize: 1000,
    enableConsole: true,
    enableStorage: false
  };

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private getUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('sb-sbzqxlwkxfwbvtbtaztq-auth-token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private getComponentFromStack(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Procurar por linha que contenha src/ mas não seja o logger
        for (const line of lines) {
          if (line.includes('src/') && !line.includes('logger.ts')) {
            const match = line.match(/\/src\/(.+?)\.tsx?/);
            if (match) {
              return match[1].split('/').pop() || 'Unknown';
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
    return 'Unknown';
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Manter apenas os últimos logs
    if (this.logs.length > (this.config.maxBufferSize || 1000)) {
      this.logs = this.logs.slice(-(this.config.maxBufferSize || 1000));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // Em produção, apenas warn, error, critical e performance
    return ['warn', 'error', 'critical', 'performance'].includes(level);
  }

  setConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Método compatível com ambas as assinaturas: (message, data?) e (component, message, data?)
  debug(componentOrMessage: string, messageOrData?: any, data?: any) {
    let component: string;
    let message: string;
    let logData: any;

    if (arguments.length >= 3) {
      // Assinatura antiga: (component, message, data)
      component = componentOrMessage;
      message = messageOrData;
      logData = data;
    } else {
      // Assinatura nova: (message, data?)
      component = this.getComponentFromStack();
      message = componentOrMessage;
      logData = messageOrData;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'debug',
      component,
      message,
      data: logData,
      userId: this.getUserId()
    };

    this.addLog(entry);
    
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.debug(`🐛 [${component}] ${message}`, logData || '');
    }
  }

  info(componentOrMessage: string, messageOrData?: any, data?: any) {
    let component: string;
    let message: string;
    let logData: any;

    if (arguments.length >= 3) {
      // Assinatura antiga: (component, message, data)
      component = componentOrMessage;
      message = messageOrData;
      logData = data;
    } else {
      // Assinatura nova: (message, data?)
      component = this.getComponentFromStack();
      message = componentOrMessage;
      logData = messageOrData;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'info',
      component,
      message,
      data: logData,
      userId: this.getUserId()
    };

    this.addLog(entry);
    
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.log(`ℹ️ [${component}] ${message}`, logData || '');
    }
  }

  warn(componentOrMessage: string, messageOrData?: any, data?: any) {
    let component: string;
    let message: string;
    let logData: any;

    if (arguments.length >= 3) {
      // Assinatura antiga: (component, message, data)
      component = componentOrMessage;
      message = messageOrData;
      logData = data;
    } else {
      // Assinatura nova: (message, data?)
      component = this.getComponentFromStack();
      message = componentOrMessage;
      logData = messageOrData;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'warn',
      component,
      message,
      data: logData,
      userId: this.getUserId()
    };

    this.addLog(entry);
    
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(`⚠️ [${component}] ${message}`, logData || '');
    }
  }

  error(componentOrMessage: string, messageOrData?: any, data?: any) {
    let component: string;
    let message: string;
    let logData: any;

    if (arguments.length >= 3) {
      // Assinatura antiga: (component, message, data)
      component = componentOrMessage;
      message = messageOrData;
      logData = data;
    } else {
      // Assinatura nova: (message, data?)
      component = this.getComponentFromStack();
      message = componentOrMessage;
      logData = messageOrData;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'error',
      component,
      message,
      data: logData,
      userId: this.getUserId()
    };

    this.addLog(entry);
    
    if (this.shouldLog('error') && this.config.enableConsole) {
      console.error(`❌ [${component}] ${message}`, logData || '');
    }
  }

  critical(componentOrMessage: string, messageOrData?: any, data?: any) {
    let component: string;
    let message: string;
    let logData: any;

    if (arguments.length >= 3) {
      // Assinatura antiga: (component, message, data)
      component = componentOrMessage;
      message = messageOrData;
      logData = data;
    } else {
      // Assinatura nova: (message, data?)
      component = this.getComponentFromStack();
      message = componentOrMessage;
      logData = messageOrData;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'critical',
      component,
      message,
      data: logData,
      userId: this.getUserId()
    };

    this.addLog(entry);
    
    if (this.config.enableConsole) {
      console.error(`🚨 [CRITICAL] [${component}] ${message}`, logData || '');
    }
  }

  performance(componentOrMessage: string, messageOrData?: any, data?: any) {
    let component: string;
    let message: string;
    let logData: any;

    if (arguments.length >= 3) {
      // Assinatura antiga: (component, message, data)
      component = componentOrMessage;
      message = messageOrData;
      logData = data;
    } else {
      // Assinatura nova: (message, data?)
      component = this.getComponentFromStack();
      message = componentOrMessage;
      logData = messageOrData;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'performance',
      component,
      message,
      data: logData,
      userId: this.getUserId()
    };

    this.addLog(entry);
    
    if (this.shouldLog('performance') && this.config.enableConsole) {
      console.debug(`⚡ [PERFORMANCE] [${component}] ${message}`, logData || '');
    }
  }

  // Método para debugging
  getLogs(level?: LogLevel, component?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (component && log.component !== component) return false;
      return true;
    });
  }

  // Método para obter buffer completo
  getBuffer(): LogEntry[] {
    return [...this.logs];
  }

  // Método para limpar buffer
  clearBuffer(): void {
    this.logs = [];
  }

  // Método para análise de problemas
  getRecentErrors(minutes: number = 10): LogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.logs.filter(log => 
      (log.level === 'error' || log.level === 'critical') && log.timestamp >= cutoff
    );
  }

  // Exportar logs para debug
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
