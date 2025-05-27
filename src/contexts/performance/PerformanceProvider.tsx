
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
  updateRealTimeStats: (stats: Partial<RealTimeStats>) => void;
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
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
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
    
    // Limitar a 50 alertas para evitar overflow de memória
    setAlerts(prev => prev.slice(-50));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const updateRealTimeStats = useCallback((newStats: Partial<RealTimeStats>) => {
    setRealTimeStats(prev => ({
      ...prev,
      ...newStats
    }));
  }, []);

  const getQueryStats = useCallback((): QueryStats => {
    // Esta função agora pode ser integrada com dados reais do Supabase
    // através dos hooks de analytics
    const currentTime = Date.now();
    const recentMetrics = metricsRef.current.filter(
      m => currentTime - (m.timestamp || 0) < 24 * 60 * 60 * 1000 // últimas 24h
    );

    const totalQueries = recentMetrics.filter(m => m.name.includes('query')).length || 150;
    const errorCount = recentMetrics.filter(m => m.name.includes('error')).length;
    const successRate = totalQueries > 0 ? ((totalQueries - errorCount) / totalQueries) * 100 : 95.5;
    
    return {
      totalQueries,
      successRate,
      errorRate: 100 - successRate,
      cacheHitRate: realTimeStats.cacheHitRate,
      avgDuration: realTimeStats.avgResponseTime || 1200,
      slowQueriesCount: recentMetrics.filter(m => m.value > alertThresholds.slowQueryMs).length,
      slowestQueries: [],
      mostErrorQueries: [],
      last24hCount: totalQueries
    };
  }, [realTimeStats, alertThresholds]);

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

      // Auto-detectar componentes lentos
      if (duration > 1000 && enableAutoAlerts) {
        addAlert({
          type: 'performance',
          message: `Componente ${componentName} demorou ${duration.toFixed(0)}ms para carregar`,
          severity: 'medium',
          metadata: { componentName, duration }
        });
      }
    };
  }, [enableAutoAlerts, addAlert]);

  const captureMetric = useCallback((metric: PerformanceMetric) => {
    try {
      const timestampedMetric = {
        ...metric,
        timestamp: metric.timestamp || Date.now()
      };

      metricsRef.current.push(timestampedMetric);

      // Manter apenas os últimos 1000 registros
      if (metricsRef.current.length > 1000) {
        metricsRef.current = metricsRef.current.slice(-1000);
      }

      // Atualizar estatísticas em tempo real baseado nas métricas
      if (metric.name.includes('query') || metric.name.includes('request')) {
        setRealTimeStats(prev => {
          const avgResponseTime = (prev.avgResponseTime + metric.value) / 2;
          return {
            ...prev,
            avgResponseTime,
            activeQueries: metric.name.includes('start') ? prev.activeQueries + 1 : 
                          metric.name.includes('end') ? Math.max(0, prev.activeQueries - 1) : 
                          prev.activeQueries
          };
        });
      }

      // Log da métrica para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[PERFORMANCE] ${metric.name}: ${metric.value}`, metric.metadata);
      }
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
    captureMetric,
    updateRealTimeStats
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
