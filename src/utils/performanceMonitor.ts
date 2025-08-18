
/**
 * Sistema centralizado de monitoramento de performance
 * Fase 1: Diagnóstico detalhado dos loading times
 */

type PerformanceEvent = {
  component: string;
  event: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
};

class PerformanceMonitor {
  private events: PerformanceEvent[] = [];
  private timers: Map<string, number> = new Map();
  private isEnabled = import.meta.env.DEV;

  startTimer(component: string, event: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    const key = `${component}.${event}`;
    const timestamp = performance.now();
    
    this.timers.set(key, timestamp);
    
    console.log(`⏱️ [PERF-START] ${component} → ${event}`, metadata || '');
  }

  endTimer(component: string, event: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    const key = `${component}.${event}`;
    const startTime = this.timers.get(key);
    
    if (!startTime) {
      console.warn(`⚠️ [PERF-WARN] Timer não encontrado para ${key}`);
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const event_data: PerformanceEvent = {
      component,
      event,
      timestamp: endTime,
      duration,
      metadata
    };
    
    this.events.push(event_data);
    this.timers.delete(key);
    
    const color = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
    console.log(`${color} [PERF-END] ${component} → ${event}: ${duration.toFixed(2)}ms`, metadata || '');
    
    // Alert para operações muito lentas
    if (duration > 2000) {
      console.error(`🚨 [PERF-CRITICAL] ${component}.${event} demorou ${duration.toFixed(2)}ms!`);
    }
  }

  logEvent(component: string, event: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    const event_data: PerformanceEvent = {
      component,
      event,
      timestamp: performance.now(),
      metadata
    };
    
    this.events.push(event_data);
    console.log(`📊 [PERF-EVENT] ${component} → ${event}`, metadata || '');
  }

  getReport() {
    if (!this.isEnabled) return null;
    
    const report = {
      totalEvents: this.events.length,
      slowOperations: this.events.filter(e => e.duration && e.duration > 1000),
      averageByComponent: this.calculateAverages(),
      recentEvents: this.events.slice(-20)
    };
    
    console.table(report.slowOperations);
    return report;
  }

  private calculateAverages() {
    const componentStats = new Map<string, { total: number; count: number; events: string[] }>();
    
    this.events.forEach(event => {
      if (!event.duration) return;
      
      const key = event.component;
      const existing = componentStats.get(key) || { total: 0, count: 0, events: [] };
      
      existing.total += event.duration;
      existing.count += 1;
      existing.events.push(event.event);
      
      componentStats.set(key, existing);
    });
    
    const averages: Record<string, any> = {};
    componentStats.forEach((stats, component) => {
      averages[component] = {
        average: stats.total / stats.count,
        totalTime: stats.total,
        callCount: stats.count,
        events: [...new Set(stats.events)]
      };
    });
    
    return averages;
  }

  reset() {
    this.events = [];
    this.timers.clear();
    console.log('🔄 [PERF] Métricas resetadas');
  }
}

export const perfMonitor = new PerformanceMonitor();

// Função helper para medir operações async
export const measureAsync = async <T>(
  component: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  perfMonitor.startTimer(component, operation, metadata);
  try {
    const result = await fn();
    perfMonitor.endTimer(component, operation, { success: true, ...metadata });
    return result;
  } catch (error) {
    perfMonitor.endTimer(component, operation, { success: false, error: error instanceof Error ? error.message : 'Unknown error', ...metadata });
    throw error;
  }
};
