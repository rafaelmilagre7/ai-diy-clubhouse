
import { useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  context?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetric[]>([]);

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

      logger.performance(`${metric.name}: ${metric.value}ms`, {
        value: metric.value,
        context: metric.context,
        metadata: metric.metadata
      });

      // Em produção, aqui enviaríamos para um serviço de analytics
      if (import.meta.env.PROD) {
        // Analytics service integration
      }
    } catch (error) {
      logger.error('Erro ao capturar métrica de performance', { error, metric: metric.name });
    }
  }, []);

  const startTiming = useCallback((name: string) => {
    const startTime = performance.now();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        captureMetric({
          name,
          value: duration,
          context: 'timing',
          metadata
        });
        
        return duration;
      }
    };
  }, [captureMetric]);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  return {
    captureMetric,
    startTiming,
    getMetrics
  };
};
