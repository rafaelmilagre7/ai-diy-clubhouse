
import { useCallback, useEffect, useRef } from 'react';
import { useLogging } from '@/hooks/useLogging';
import { logger } from '@/utils/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: string;
  metadata?: Record<string, any>;
}

interface UsePerformanceMonitorOptions {
  enableWebVitals?: boolean;
  enableCustomMetrics?: boolean;
  enableAutoLogging?: boolean;
  sampleRate?: number;
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    enableWebVitals = true,
    enableCustomMetrics = true,
    enableAutoLogging = true,
    sampleRate = 1.0
  } = options;

  const { log } = useLogging();
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Capturar uma métrica de performance
  const captureMetric = useCallback((metric: Omit<PerformanceMetric, 'timestamp'>) => {
    if (Math.random() > sampleRate) return;

    const performanceMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    metricsRef.current.push(performanceMetric);

    if (enableAutoLogging) {
      logger.info(`Performance Metric: ${metric.name}`, {
        value: metric.value,
        context: metric.context,
        metadata: metric.metadata
      });

      log('performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        context: metric.context,
        metadata: metric.metadata,
        category: 'performance'
      });
    }
  }, [enableAutoLogging, log, sampleRate]);

  // Medir tempo de execução de uma função
  const measureExecutionTime = useCallback(<T>(
    name: string,
    fn: () => T | Promise<T>,
    context?: string
  ): T | Promise<T> => {
    const startTime = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        captureMetric({
          name,
          value: endTime - startTime,
          context,
          metadata: { type: 'async_execution' }
        });
      });
    } else {
      const endTime = performance.now();
      captureMetric({
        name,
        value: endTime - startTime,
        context,
        metadata: { type: 'sync_execution' }
      });
      return result;
    }
  }, [captureMetric]);

  // Medir tempo de carregamento de componente
  const measureComponentLoad = useCallback((componentName: string, context?: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      captureMetric({
        name: `component_load_${componentName}`,
        value: endTime - startTime,
        context,
        metadata: { type: 'component_load' }
      });
    };
  }, [captureMetric]);

  // Medir Navigation Timing
  const captureNavigationTiming = useCallback(() => {
    if (!window.performance?.timing) return;

    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    const metrics = [
      { name: 'dns_lookup', value: timing.domainLookupEnd - timing.domainLookupStart },
      { name: 'tcp_connect', value: timing.connectEnd - timing.connectStart },
      { name: 'request_response', value: timing.responseEnd - timing.requestStart },
      { name: 'dom_loading', value: timing.domComplete - timing.domLoading },
      { name: 'page_load_total', value: timing.loadEventEnd - navigationStart }
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        captureMetric({
          ...metric,
          context: 'navigation_timing',
          metadata: { type: 'navigation' }
        });
      }
    });
  }, [captureMetric]);

  // Obter todas as métricas capturadas
  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Limpar métricas
  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  // Obter estatísticas das métricas
  const getMetricStats = useCallback((metricName: string) => {
    const metrics = metricsRef.current.filter(m => m.name === metricName);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }, []);

  // Inicializar Performance Observer para Web Vitals
  useEffect(() => {
    if (!enableWebVitals || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          captureMetric({
            name: entry.entryType,
            value: entry.startTime,
            context: 'web_vitals',
            metadata: {
              type: 'web_vital',
              entryType: entry.entryType,
              name: entry.name
            }
          });
        });
      });

      // Observar diferentes tipos de métricas
      const entryTypes = ['navigation', 'measure', 'paint'];
      entryTypes.forEach(type => {
        try {
          observer.observe({ entryTypes: [type] });
        } catch (e) {
          // Tipo não suportado no browser
        }
      });

      observerRef.current = observer;

      return () => {
        observer.disconnect();
      };
    } catch (error) {
      logger.warn('Performance Observer não suportado', { error });
    }
  }, [enableWebVitals, captureMetric]);

  // Capturar Navigation Timing quando disponível
  useEffect(() => {
    if (document.readyState === 'complete') {
      setTimeout(() => captureNavigationTiming(), 0);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => captureNavigationTiming(), 0);
      });
    }
  }, [captureNavigationTiming]);

  return {
    captureMetric,
    measureExecutionTime,
    measureComponentLoad,
    getMetrics,
    clearMetrics,
    getMetricStats,
    captureNavigationTiming
  };
};

export default usePerformanceMonitor;
