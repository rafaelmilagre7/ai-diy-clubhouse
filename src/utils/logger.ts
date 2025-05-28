
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  userId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // Em produção, apenas warn e error
    return level === 'warn' || level === 'error';
  }

  debug(component: string, message: string, data?: any, userId?: string) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'debug',
      component,
      message,
      data,
      userId
    };

    this.addLog(entry);
    
    if (this.shouldLog('debug')) {
      console.log(`🐛 [${component}] ${message}`, data || '');
    }
  }

  info(component: string, message: string, data?: any, userId?: string) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'info',
      component,
      message,
      data,
      userId
    };

    this.addLog(entry);
    
    if (this.shouldLog('info')) {
      console.log(`ℹ️ [${component}] ${message}`, data || '');
    }
  }

  warn(component: string, message: string, data?: any, userId?: string) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'warn',
      component,
      message,
      data,
      userId
    };

    this.addLog(entry);
    
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ [${component}] ${message}`, data || '');
    }
  }

  error(component: string, message: string, data?: any, userId?: string) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: 'error',
      component,
      message,
      data,
      userId
    };

    this.addLog(entry);
    
    if (this.shouldLog('error')) {
      console.error(`❌ [${component}] ${message}`, data || '');
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

  // Método para análise de problemas
  getRecentErrors(minutes: number = 10): LogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.logs.filter(log => 
      log.level === 'error' && log.timestamp >= cutoff
    );
  }

  // Exportar logs para debug
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
