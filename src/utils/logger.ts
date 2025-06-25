
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  info(message: string, data?: any, context?: any) {
    this.log('info', message, data || context);
    console.log(`[INFO] ${message}`, data || context);
  }

  warn(message: string, data?: any, context?: any) {
    this.log('warn', message, data || context);
    console.warn(`[WARN] ${message}`, data || context);
  }

  error(message: string, data?: any, context?: any) {
    this.log('error', message, data || context);
    console.error(`[ERROR] ${message}`, data || context);
  }

  debug(message: string, data?: any, context?: any) {
    this.log('debug', message, data || context);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || context);
    }
  }

  // Método para compatibilidade com chamadas de 3 argumentos
  security(message: string, data?: any, context?: any) {
    this.log('warn', `[SECURITY] ${message}`, data || context);
    console.warn(`[SECURITY] ${message}`, data || context);
  }

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date()
    };

    this.logs.push(entry);

    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
