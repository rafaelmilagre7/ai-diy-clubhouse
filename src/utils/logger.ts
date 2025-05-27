
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: LogLevel[] = this.isDevelopment 
    ? ['debug', 'info', 'warn', 'error']
    : ['warn', 'error'];

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  debug(message: string, data?: any) {
    if (this.enabledLevels.includes('debug')) {
      const entry = this.formatMessage('debug', message, data);
      console.debug(`[${entry.timestamp}] DEBUG: ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.enabledLevels.includes('info')) {
      const entry = this.formatMessage('info', message, data);
      console.info(`[${entry.timestamp}] INFO: ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.enabledLevels.includes('warn')) {
      const entry = this.formatMessage('warn', message, data);
      console.warn(`[${entry.timestamp}] WARN: ${message}`, data || '');
    }
  }

  error(message: string, error?: any) {
    if (this.enabledLevels.includes('error')) {
      const entry = this.formatMessage('error', message, error);
      console.error(`[${entry.timestamp}] ERROR: ${message}`, error || '');
    }
  }
}

export const logger = new Logger();
