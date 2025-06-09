
import { sanitizeForLogging } from './securityUtils';

// Níveis de log seguros
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  data?: any;
  timestamp: string;
  sessionId?: string;
}

class SecureLogger {
  private static instance: SecureLogger;
  private logLevel: LogLevel = 'info';
  private consoleEnabled: boolean = true;
  private maxLogEntries: number = 100;
  private logBuffer: LogEntry[] = [];
  
  private constructor() {
    // Configurar baseado no ambiente
    if (process.env.NODE_ENV === 'production') {
      this.logLevel = 'warn';
      this.consoleEnabled = false;
    }
  }
  
  static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger();
    }
    return SecureLogger.instance;
  }

  // Configurar nível de log
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Configurar console
  setConsoleEnabled(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }

  // Verificar se deve fazer log
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  // Sanitizar dados de log
  private sanitizeLogData(data: any): any {
    return sanitizeForLogging(data);
  }

  // Fazer log seguro
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      level,
      message,
      component: data?.component || 'UNKNOWN',
      data: this.sanitizeLogData(data),
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };

    // Adicionar ao buffer
    this.logBuffer.push(logEntry);
    
    // Manter apenas os últimos logs
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.maxLogEntries);
    }

    // Log no console se habilitado
    if (this.consoleEnabled) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // Em produção, enviar logs críticos para auditoria
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      this.sendCriticalLog(logEntry);
    }
  }

  // Obter ID da sessão de forma segura
  private getSessionId(): string {
    try {
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed.access_token?.substring(0, 16) + '***' || 'unknown';
      }
    } catch {
      // Ignorar erro
    }
    return 'unknown';
  }

  // Enviar logs críticos (implementação futura)
  private async sendCriticalLog(logEntry: LogEntry): Promise<void> {
    try {
      // Implementar envio para auditoria se necessário
      // Por agora, apenas manter no buffer
    } catch {
      // Falhar silenciosamente
    }
  }

  // Métodos públicos de log
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // Obter logs para debug
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logBuffer.filter(entry => entry.level === level);
    }
    return [...this.logBuffer];
  }

  // Limpar logs
  clearLogs(): void {
    this.logBuffer = [];
  }

  // Exportar logs para análise
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Instância global
export const logger = SecureLogger.getInstance();

// Configurar logger globalmente para desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).logger = logger;
}
