
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
  userId?: string;
}

interface LoggerConfig {
  enabledLevels: LogLevel[];
  enableConsole: boolean;
  enableRemote: boolean;
  maxBufferSize: number;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];

  constructor() {
    this.config = {
      enabledLevels: this.isDevelopment 
        ? ['debug', 'info', 'warn', 'error']
        : ['warn', 'error'],
      enableConsole: true,
      enableRemote: !this.isDevelopment,
      maxBufferSize: 100
    };
  }

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      context,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Safely get user ID without causing circular dependencies
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Silently fail if unable to get user ID
    }
    return undefined;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabledLevels.includes(level);
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > this.config.maxBufferSize) {
      this.buffer.shift();
    }
  }

  private consoleLog(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}${entry.context ? ` [${entry.context}]` : ''}`;
    const message = `${prefix}: ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data || '');
        break;
      case 'info':
        console.info(message, entry.data || '');
        break;
      case 'warn':
        console.warn(message, entry.data || '');
        break;
      case 'error':
        console.error(message, entry.data || '');
        break;
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.formatMessage('debug', message, data, context);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.formatMessage('info', message, data, context);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.formatMessage('warn', message, data, context);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  error(message: string, error?: any, context?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.formatMessage('error', message, error, context);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  // Métodos específicos para contextos
  performance(message: string, data?: any): void {
    this.debug(message, data, 'PERFORMANCE');
  }

  query(message: string, data?: any): void {
    this.debug(message, data, 'QUERY');
  }

  auth(message: string, data?: any): void {
    this.info(message, data, 'AUTH');
  }

  api(message: string, data?: any): void {
    this.info(message, data, 'API');
  }

  // Métodos de configuração
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  clearBuffer(): void {
    this.buffer = [];
  }

  // Método para logs de produção críticos
  critical(message: string, data?: any, context?: string): void {
    const entry = this.formatMessage('error', `CRITICAL: ${message}`, data, context);
    this.addToBuffer(entry);
    
    // Sempre loga críticos, independente da configuração
    console.error(`[CRITICAL] ${entry.timestamp}: ${message}`, data || '');
  }
}

export const logger = new Logger();
