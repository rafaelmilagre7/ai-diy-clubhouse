
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: LogLevel[] = this.isDevelopment 
    ? ['debug', 'info', 'warn', 'error']
    : ['warn', 'error'];

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    };
  }

  debug(message: string, data?: any, context?: string) {
    if (this.enabledLevels.includes('debug')) {
      const entry = this.formatMessage('debug', message, data, context);
      console.debug(`[${entry.timestamp}] DEBUG${context ? ` [${context}]` : ''}: ${message}`, data || '');
    }
  }

  info(message: string, data?: any, context?: string) {
    if (this.enabledLevels.includes('info')) {
      const entry = this.formatMessage('info', message, data, context);
      console.info(`[${entry.timestamp}] INFO${context ? ` [${context}]` : ''}: ${message}`, data || '');
    }
  }

  warn(message: string, data?: any, context?: string) {
    if (this.enabledLevels.includes('warn')) {
      const entry = this.formatMessage('warn', message, data, context);
      console.warn(`[${entry.timestamp}] WARN${context ? ` [${context}]` : ''}: ${message}`, data || '');
    }
  }

  error(message: string, error?: any, context?: string) {
    if (this.enabledLevels.includes('error')) {
      const entry = this.formatMessage('error', message, error, context);
      console.error(`[${entry.timestamp}] ERROR${context ? ` [${context}]` : ''}: ${message}`, error || '');
    }
  }

  // Métodos específicos para contextos
  performance(message: string, data?: any) {
    this.debug(message, data, 'PERFORMANCE');
  }

  query(message: string, data?: any) {
    this.debug(message, data, 'QUERY');
  }

  auth(message: string, data?: any) {
    this.info(message, data, 'AUTH');
  }

  api(message: string, data?: any) {
    this.info(message, data, 'API');
  }
}

export const logger = new Logger();
