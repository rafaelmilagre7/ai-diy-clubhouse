
import { useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

interface QueryMetrics {
  queryKey: string;
  duration: number;
  cacheHit: boolean;
  error?: string;
  timestamp: number;
}

interface PerformanceMetrics {
  averageQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
  slowQueries: QueryMetrics[];
}

export const usePerformanceMonitoring = () => {
  const metricsRef = useRef<QueryMetrics[]>([]);
  const slowQueryThreshold = 2000; // 2 segundos

  // Registrar métrica de query
  const recordQueryMetric = useCallback((
    queryKey: string,
    duration: number,
    cacheHit: boolean,
    error?: string
  ) => {
    const metric: QueryMetrics = {
      queryKey,
      duration,
      cacheHit,
      error,
      timestamp: Date.now()
    };

    metricsRef.current.push(metric);

    // Manter apenas últimas 100 métricas para performance
    if (metricsRef.current.length > 100) {
      metricsRef.current = metricsRef.current.slice(-100);
    }

    // Log de queries lentas
    if (duration > slowQueryThreshold) {
      console.warn('Slow query detected:', {
        queryKey,
        duration: `${duration}ms`,
        cacheHit
      });
    }
  }, [slowQueryThreshold]);

  // Calcular métricas agregadas
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const metrics = metricsRef.current;
    const now = Date.now();
    const last5Minutes = metrics.filter(m => now - m.timestamp <= 5 * 60 * 1000);

    if (last5Minutes.length === 0) {
      return {
        averageQueryTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        slowQueries: []
      };
    }

    const totalTime = last5Minutes.reduce((sum, m) => sum + m.duration, 0);
    const cacheHits = last5Minutes.filter(m => m.cacheHit).length;
    const errors = last5Minutes.filter(m => m.error).length;
    const slowQueries = last5Minutes.filter(m => m.duration > slowQueryThreshold);

    return {
      averageQueryTime: Math.round(totalTime / last5Minutes.length),
      cacheHitRate: Math.round((cacheHits / last5Minutes.length) * 100),
      errorRate: Math.round((errors / last5Minutes.length) * 100),
      slowQueries: slowQueries.slice(-10) // Últimas 10 queries lentas
    };
  }, [slowQueryThreshold]);

  // Hook para monitorar queries automaticamente
  const useMonitoredQuery = useCallback(<T>(
    queryKey: any[],
    queryFn: () => Promise<T>,
    options: any = {}
  ) => {
    const startTime = useRef<number>();

    return useQuery({
      queryKey,
      queryFn: async () => {
        startTime.current = performance.now();
        try {
          const result = await queryFn();
          const duration = performance.now() - startTime.current!;
          recordQueryMetric(
            Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey),
            duration,
            false // Assumindo miss - será otimizado posteriormente
          );
          return result;
        } catch (error) {
          const duration = performance.now() - startTime.current!;
          recordQueryMetric(
            Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey),
            duration,
            false,
            error instanceof Error ? error.message : 'Unknown error'
          );
          throw error;
        }
      },
      ...options
    });
  }, [recordQueryMetric]);

  // Métricas em tempo real para desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const metrics = getPerformanceMetrics();
        if (metrics.slowQueries.length > 0 || metrics.errorRate > 10) {
          console.group('🔍 Performance Metrics');
          console.log('Average Query Time:', `${metrics.averageQueryTime}ms`);
          console.log('Cache Hit Rate:', `${metrics.cacheHitRate}%`);
          console.log('Error Rate:', `${metrics.errorRate}%`);
          if (metrics.slowQueries.length > 0) {
            console.log('Recent Slow Queries:', metrics.slowQueries);
          }
          console.groupEnd();
        }
      }, 30000); // A cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [getPerformanceMetrics]);

  return {
    recordQueryMetric,
    getPerformanceMetrics,
    useMonitoredQuery
  };
};
