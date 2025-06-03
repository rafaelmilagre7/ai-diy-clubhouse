
import { useCallback, useEffect } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';

interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Hook para monitoramento de Web Vitals
 * Captura métricas de performance essenciais
 */
export const useWebVitals = () => {
  const { captureMetric } = usePerformanceMonitor();

  const onWebVital = useCallback((metric: WebVitalMetric) => {
    captureMetric({
      name: `web_vital_${metric.name.toLowerCase()}`,
      value: metric.value,
      context: 'web_vitals',
      metadata: {
        type: 'web_vital',
        metricName: metric.name,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id
      }
    });

    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[WEB VITALS] ${metric.name}: ${metric.value} (${metric.rating})`);
    }
  }, [captureMetric]);

  const getThreshold = useCallback((metricName: string, rating: 'good' | 'poor') => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    return thresholds[metricName as keyof typeof thresholds]?.[rating] || 0;
  }, []);

  useEffect(() => {
    // Verificar se Web Vitals API está disponível
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Observar métricas de paint
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            onWebVital({
              name: 'FCP',
              value: entry.startTime,
              delta: entry.startTime,
              id: 'fcp',
              rating: entry.startTime <= 1800 ? 'good' : entry.startTime <= 3000 ? 'needs-improvement' : 'poor'
            });
          }
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });

      // Observar layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        if (clsValue > 0) {
          onWebVital({
            name: 'CLS',
            value: clsValue,
            delta: clsValue,
            id: 'cls',
            rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
          });
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Cleanup
      return () => {
        paintObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch (error) {
      console.warn('Web Vitals monitoring não suportado:', error);
    }
  }, [onWebVital]);

  // Capturar métricas de navegação
  useEffect(() => {
    if (document.readyState === 'complete') {
      // Página já carregada, capturar métricas imediatamente
      const timing = performance.timing;
      
      const ttfb = timing.responseStart - timing.navigationStart;
      onWebVital({
        name: 'TTFB',
        value: ttfb,
        delta: ttfb,
        id: 'ttfb',
        rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor'
      });
    }
  }, [onWebVital]);

  return {
    onWebVital,
    getThreshold
  };
};
