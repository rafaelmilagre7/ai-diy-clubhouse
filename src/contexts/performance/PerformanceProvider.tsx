
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { PerformanceAlert, RealTimeStats, QueryStats, PerformanceMetric, AlertThresholds } from '@/types/performanceTypes';

interface PerformanceContextType {
  realTimeStats: RealTimeStats;
  addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  isMonitoring: boolean;
  setIsMonitoring: (monitoring: boolean) => void;
  alerts: PerformanceAlert[];
  clearAlerts: () => void;
  getQueryStats: () => QueryStats;
  measureComponentLoad: (componentName: string, context?: string) => () => void;
  captureMetric: (metric: PerformanceMetric) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
  enableAutoAlerts?: boolean;
  alertThresholds?: AlertThresholds;
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
  const [realTimeStats] = useState<RealTimeStats>({
    activeQueries: 0,
    avgResponseTime: 0,
    memoryUsage: 0,
    errorRate: 0,
    cacheHitRate: 75
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const metricsRef = useRef<PerformanceMetric[]>([]);

  const addAlert = useCallback((alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getQueryStats = useCallback((): QueryStats => {
    // Implementação básica que retorna dados mock
    return {
      totalQueries: 150,
      successRate: 95.5,
      errorRate: 4.5,
      cacheHitRate: 75,
      avgDuration: 1200,
      slowQueriesCount: 3,
      slowestQueries: [],
      mostErrorQueries: [],
      last24hCount: 150
    };
  }, []);

  const measureComponentLoad = useCallback((componentName: string, context: string = 'component') => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      captureMetric({
        name: `component_load_${componentName}`,
        value: duration,
        context,
        metadata: {
          componentName,
          type: 'component_load'
        }
      });
    };
  }, []);

  const captureMetric = useCallback((metric: PerformanceMetric) => {
    try {
      metricsRef.current.push({
        ...metric,
        timestamp: Date.now()
      } as any);

      // Manter apenas os últimos 1000 registros
      if (metricsRef.current.length > 1000) {
        metricsRef.current = metricsRef.current.slice(-1000);
      }

      // Log da métrica
      console.debug(`[PERFORMANCE] ${metric.name}: ${metric.value}`, metric.metadata);
    } catch (error) {
      console.error('Erro ao capturar métrica de performance', { error, metric: metric.name });
    }
  }, []);

  const value = {
    realTimeStats,
    addAlert,
    isMonitoring,
    setIsMonitoring,
    alerts,
    clearAlerts,
    getQueryStats,
    measureComponentLoad,
    captureMetric
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
