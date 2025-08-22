/**
 * Sistema de logs estruturados específico para a seção Formação
 * Facilita debugging e monitoramento de problemas intermitentes
 */

interface FormacaoLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  action: string;
  moduleId?: string;
  courseId?: string;
  lessonId?: string;
  data?: any;
  performance?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

class FormacaoLogger {
  private logs: FormacaoLogEntry[] = [];
  private maxLogs = 100; // Manter apenas os últimos 100 logs
  
  private createEntry(
    level: 'info' | 'warn' | 'error',
    component: string,
    action: string,
    data?: any,
    performance?: { startTime: number; endTime: number; duration: number }
  ): FormacaoLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      action,
      moduleId: data?.moduleId,
      courseId: data?.courseId,
      lessonId: data?.lessonId,
      data: { ...data },
      performance
    };
  }
  
  info(component: string, action: string, data?: any) {
    const entry = this.createEntry('info', component, action, data);
    this.logs.push(entry);
    this.trimLogs();
    
    // Log no console apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[FORMACAO_LOG] ${component} - ${action}`, data);
    }
  }
  
  warn(component: string, action: string, data?: any) {
    const entry = this.createEntry('warn', component, action, data);
    this.logs.push(entry);
    this.trimLogs();
    
    console.warn(`[FORMACAO_LOG] ${component} - ${action}`, data);
  }
  
  error(component: string, action: string, data?: any) {
    const entry = this.createEntry('error', component, action, data);
    this.logs.push(entry);
    this.trimLogs();
    
    console.error(`[FORMACAO_LOG] ${component} - ${action}`, data);
    
    // Salvar erros críticos no localStorage para análise posterior
    try {
      const criticalErrors = JSON.parse(localStorage.getItem('formacao_critical_errors') || '[]');
      criticalErrors.push(entry);
      
      // Manter apenas os últimos 10 erros críticos
      const limitedErrors = criticalErrors.slice(-10);
      localStorage.setItem('formacao_critical_errors', JSON.stringify(limitedErrors));
    } catch (e) {
      // Ignorar erro de storage
    }
  }
  
  // Log com medição de performance
  performance(component: string, action: string, startTime: number, data?: any) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    const performanceData = { startTime, endTime, duration };
    const entry = this.createEntry('info', component, action, data, performanceData);
    this.logs.push(entry);
    this.trimLogs();
    
    const level = duration > 2000 ? 'warn' : 'info';
    const message = `${component} - ${action} (${duration}ms)`;
    
    if (import.meta.env.DEV) {
      if (level === 'warn') {
        console.warn(`[FORMACAO_PERF] ${message}`, data);
      } else {
        console.log(`[FORMACAO_PERF] ${message}`, data);
      }
    }
  }
  
  // Recuperar logs para debugging
  getLogs(filter?: { 
    level?: 'info' | 'warn' | 'error';
    component?: string;
    since?: Date;
  }): FormacaoLogEntry[] {
    let filteredLogs = [...this.logs];
    
    if (filter?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }
    
    if (filter?.component) {
      filteredLogs = filteredLogs.filter(log => log.component === filter.component);
    }
    
    if (filter?.since) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filter.since!);
    }
    
    return filteredLogs;
  }
  
  // Obter estatísticas dos logs
  getStats() {
    const now = new Date();
    const lastMinute = new Date(now.getTime() - 60000);
    const last5Minutes = new Date(now.getTime() - 300000);
    
    const recentLogs = this.logs.filter(log => new Date(log.timestamp) >= lastMinute);
    const last5MinuteLogs = this.logs.filter(log => new Date(log.timestamp) >= last5Minutes);
    
    return {
      totalLogs: this.logs.length,
      lastMinute: {
        total: recentLogs.length,
        errors: recentLogs.filter(l => l.level === 'error').length,
        warnings: recentLogs.filter(l => l.level === 'warn').length
      },
      last5Minutes: {
        total: last5MinuteLogs.length,
        errors: last5MinuteLogs.filter(l => l.level === 'error').length,
        warnings: last5MinuteLogs.filter(l => l.level === 'warn').length,
        avgPerformance: this.getAveragePerformance(last5MinuteLogs)
      }
    };
  }
  
  private getAveragePerformance(logs: FormacaoLogEntry[]): number | null {
    const performanceLogs = logs.filter(log => log.performance);
    if (performanceLogs.length === 0) return null;
    
    const totalDuration = performanceLogs.reduce((sum, log) => sum + (log.performance?.duration || 0), 0);
    return Math.round(totalDuration / performanceLogs.length);
  }
  
  private trimLogs() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  // Exportar logs para análise
  exportLogs(): string {
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      stats: this.getStats(),
      logs: this.logs
    }, null, 2);
  }
  
  // Limpar todos os logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('formacao_critical_errors');
  }
  
  // Debug: mostrar últimos logs no console
  debugPrint(count = 10) {
    const recentLogs = this.logs.slice(-count);
    console.group(`[FORMACAO_DEBUG] Últimos ${count} logs:`);
    recentLogs.forEach(log => {
      const prefix = `[${log.timestamp}] ${log.component} - ${log.action}`;
      switch (log.level) {
        case 'error':
          console.error(prefix, log);
          break;
        case 'warn':
          console.warn(prefix, log);
          break;
        default:
          console.log(prefix, log);
      }
    });
    console.groupEnd();
  }
}

// Instância global
export const formacaoLogger = new FormacaoLogger();

// Helper functions para uso fácil
export const logFormacaoInfo = (component: string, action: string, data?: any) => 
  formacaoLogger.info(component, action, data);

export const logFormacaoWarn = (component: string, action: string, data?: any) => 
  formacaoLogger.warn(component, action, data);

export const logFormacaoError = (component: string, action: string, data?: any) => 
  formacaoLogger.error(component, action, data);

export const logFormacaoPerf = (component: string, action: string, startTime: number, data?: any) => 
  formacaoLogger.performance(component, action, startTime, data);

// Hook para debugging - disponível globalmente no window em dev
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).formacaoLogger = formacaoLogger;
  console.log('🔍 FormacaoLogger disponível em window.formacaoLogger para debugging');
}