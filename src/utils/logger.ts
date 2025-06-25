
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  info(message: string, data?: any) {
    this.log('info', message, data);
    console.log(`[INFO] ${message}`, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
    console.warn(`[WARN] ${message}`, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
    console.error(`[ERROR] ${message}`, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
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
