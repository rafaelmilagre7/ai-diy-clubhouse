
import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { useWebVitals } from '@/hooks/performance/useWebVitals';
import { useQueryPerformance } from '@/hooks/performance/useQueryPerformance';
import { logger } from '@/utils/logger';

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'error' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceContextType {
  // Métricas
  captureMetric: (metric: { name: string; value: number; context?: string; metadata?: Record<string, any> }) => void;
  measureExecutionTime: <T>(name: string, fn: () => T | Promise<T>, context?: string) => T | Promise<T>;
  measureComponentLoad: (componentName: string, context?: string) => () => void;
  
  // Queries
  trackQuery: (queryKey: string[], startTime?: number) => any;
  getQueryStats: () => any;
  
  // Alertas
  alerts: PerformanceAlert[];
  addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  
  // Estado
  isMonitoring: boolean;
  setIsMonitoring: (monitoring: boolean) => void;
  
  // Estatísticas em tempo real
  realTimeStats: {
    activeQueries: number;
    avgResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
  enableAutoAlerts?: boolean;
  alertThresholds?: {
    slowQueryMs?: number;
    highErrorRate?: number;
    lowCacheHitRate?: number;
  };
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableAutoAlerts = true,
  alertThresholds = {
    slowQueryMs: 3000,
    highErrorRate: 10,
    lowCacheHitRate: 50
  }
}) => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [realTimeStats, setRealTimeStats] = useState({
    activeQueries: 0,
    avgResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0
  });

  const performanceMonitor = usePerformanceMonitor({
    enableWebVitals: isMonitoring,
    enableCustomMetrics: isMonitoring,
    enableAutoLogging: isMonitoring
  });

  const webVitals = useWebVitals();
  const queryPerformance = useQueryPerformance();

  // Adicionar alerta
  const addAlert = useCallback((alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Manter apenas 50 alertas

    // Log do alerta
    if (alert.severity === 'high') {
      logger.error(`Performance Alert: ${alert.message}`, alert.metadata);
    } else if (alert.severity === 'medium') {
      logger.warn(`Performance Alert: ${alert.message}`, alert.metadata);
    } else {
      logger.info(`Performance Alert: ${alert.message}`, alert.metadata);
    }
  }, []);

  // Limpar alertas
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Atualizar estatísticas em tempo real
  const updateRealTimeStats = useCallback(() => {
    if (!isMonitoring) return;

    try {
      const queryStats = queryPerformance.getQueryStats();
      const cacheStats = queryPerformance.getCacheStats();

      setRealTimeStats({
        activeQueries: cacheStats.loadingQueries || 0,
        avgResponseTime: queryStats.avgDuration || 0,
        errorRate: queryStats.errorRate || 0,
        cacheHitRate: queryStats.cacheHitRate || 0
      });

      // Verificar thresholds para alertas automáticos
      if (enableAutoAlerts) {
        if (queryStats.avgDuration > alertThresholds.slowQueryMs!) {
          addAlert({
            type: 'performance',
            message: `Queries lentas detectadas: ${queryStats.avgDuration.toFixed(0)}ms em média`,
            severity: 'medium',
            metadata: { avgDuration: queryStats.avgDuration, threshold: alertThresholds.slowQueryMs }
          });
        }

        if (queryStats.errorRate > alertThresholds.highErrorRate!) {
          addAlert({
            type: 'error',
            message: `Taxa de erro alta: ${queryStats.errorRate.toFixed(1)}%`,
            severity: 'high',
            metadata: { errorRate: queryStats.errorRate, threshold: alertThresholds.highErrorRate }
          });
        }

        if (queryStats.cacheHitRate < alertThresholds.lowCacheHitRate! && queryStats.totalQueries > 10) {
          addAlert({
            type: 'performance',
            message: `Cache hit rate baixo: ${queryStats.cacheHitRate.toFixed(1)}%`,
            severity: 'medium',
            metadata: { cacheHitRate: queryStats.cacheHitRate, threshold: alertThresholds.lowCacheHitRate }
          });
        }
      }
    } catch (error) {
      logger.warn('Erro ao atualizar estatísticas de performance', { error });
    }
  }, [isMonitoring, queryPerformance, enableAutoAlerts, alertThresholds, addAlert]);

  // Atualizar estatísticas periodicamente
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateRealTimeStats, 30000); // A cada 30 segundos
    
    // Primeira atualização
    updateRealTimeStats();

    return () => clearInterval(interval);
  }, [isMonitoring, updateRealTimeStats]);

  // Limpar alertas antigos automaticamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
      setAlerts(prev => prev.filter(alert => alert.timestamp > cutoff));
    }, 60000); // A cada minuto

    return () => clearInterval(cleanup);
  }, []);

  // Wrapper para trackQuery com alertas automáticos
  const trackQueryWithAlerts = useCallback((queryKey: string[], startTime = Date.now()) => {
    const tracker = queryPerformance.trackQuery(queryKey, startTime);
    
    return {
      success: (data: any, fromCache: boolean = false) => {
        tracker.success(data, fromCache);
        
        const duration = Date.now() - startTime;
        if (duration > alertThresholds.slowQueryMs! && enableAutoAlerts) {
          addAlert({
            type: 'performance',
            message: `Query lenta: ${JSON.stringify(queryKey)} (${duration}ms)`,
            severity: duration > 5000 ? 'high' : 'medium',
            metadata: { queryKey, duration, fromCache }
          });
        }
      },
      
      error: (error: any) => {
        tracker.error(error);
        
        if (enableAutoAlerts) {
          addAlert({
            type: 'error',
            message: `Erro na query: ${JSON.stringify(queryKey)}`,
            severity: 'high',
            metadata: { queryKey, error: error?.message }
          });
        }
      }
    };
  }, [queryPerformance, alertThresholds, enableAutoAlerts, addAlert]);

  const contextValue: PerformanceContextType = {
    // Métricas
    captureMetric: performanceMonitor.captureMetric,
    measureExecutionTime: performanceMonitor.measureExecutionTime,
    measureComponentLoad: performanceMonitor.measureComponentLoad,
    
    // Queries
    trackQuery: trackQueryWithAlerts,
    getQueryStats: queryPerformance.getQueryStats,
    
    // Alertas
    alerts,
    addAlert,
    clearAlerts,
    
    // Estado
    isMonitoring,
    setIsMonitoring,
    
    // Estatísticas em tempo real
    realTimeStats
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export default PerformanceProvider;
