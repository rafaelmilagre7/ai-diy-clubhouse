
import { useCallback } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  context?: string;
  metadata?: Record<string, any>;
}

export const usePerformanceMonitor = () => {
  const captureMetric = useCallback((metric: PerformanceMetric) => {
    try {
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

  return {
    captureMetric,
    startTiming
  };
};
