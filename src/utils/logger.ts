
// Logger simplificado que não acessa localStorage durante inicialização
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'critical' | 'performance';
  message: string;
  data?: any;
  userId?: string;
  component?: string;
}

interface LoggerConfig {
  maxBufferSize: number;
  enableConsole: boolean;
}

class Logger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig = {
    maxBufferSize: 1000,
    enableConsole: true
  };

  private getUserId(): string | undefined {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const session = localStorage.getItem('sb-zotzvtepvpnkcoobdubt-auth-token');
        if (session) {
          const parsed = JSON.parse(session);
          return parsed?.user?.id;
        }
      }
    } catch {
      // Silently fail if can't access localStorage
    }
    return undefined;
  }

  private log(level: 'info' | 'warn' | 'error' | 'debug' | 'critical' | 'performance', message: string, data?: any, component?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.getUserId(),
      component: component || 'Unknown'
    };
    
    this.logs.push(entry);
    
    // Manage buffer size
    if (this.logs.length > this.config.maxBufferSize) {
      this.logs.shift();
    }
    
    // Log to console if enabled
    if (this.config.enableConsole) {
      switch (level) {
        case 'info':
          console.log(`[INFO] ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`[WARN] ${message}`, data || '');
          break;
        case 'error':
          console.error(`[ERROR] ${message}`, data || '');
          break;
        case 'debug':
          console.debug(`[DEBUG] ${message}`, data || '');
          break;
        case 'critical':
          console.error(`🚨 [CRITICAL] [${component || 'Unknown'}] ${message}`, data || '');
          break;
        case 'performance':
          console.debug(`⚡ [PERFORMANCE] [${component || 'Unknown'}] ${message}`, data || '');
          break;
      }
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  critical(message: string, data?: any) {
    this.log('critical', message, data);
  }

  performance(message: string, data?: any) {
    this.log('performance', message, data);
  }

  // Métodos para gerenciamento do buffer
  getBuffer(): LogEntry[] {
    return [...this.logs];
  }

  clearBuffer() {
    this.logs = [];
  }

  // Configuração
  setConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Métodos de filtragem
  getLogs(level?: string, component?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (component && log.component !== component) return false;
      return true;
    });
  }

  // Exportar logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Obter erros recentes
  getRecentErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error' || log.level === 'critical');
  }
}

export const logger = new Logger();
