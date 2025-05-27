
import { useCallback, useEffect } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { logger } from '@/utils/logger';

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const useWebVitals = () => {
  const { captureMetric } = usePerformanceMonitor();

  const onWebVital = useCallback((metric: WebVitalsMetric) => {
    captureMetric({
      name: `web_vital_${metric.name.toLowerCase()}`,
      value: metric.value,
      context: 'web_vitals',
      metadata: {
        type: 'web_vital',
        metric_name: metric.name,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id
      }
    });

    // Log específico para Web Vitals críticas
    if (metric.rating === 'poor') {
      logger.warn(`Poor Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        threshold: getThreshold(metric.name, 'poor')
      });
    }
  }, [captureMetric]);

  // Thresholds para Web Vitals
  const getThreshold = (name: string, rating: 'good' | 'poor') => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };
    
    return thresholds[name as keyof typeof thresholds]?.[rating] || 0;
  };

  // Inicializar Web Vitals (usando dynamic import para evitar SSR issues)
  useEffect(() => {
    const initWebVitals = async () => {
      try {
        // Simular captura de Web Vitals usando Performance API nativa
        if (!window.performance) return;

        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
          try {
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              
              if (lastEntry) {
                onWebVital({
                  name: 'LCP',
                  value: lastEntry.startTime,
                  delta: lastEntry.startTime,
                  id: `lcp-${Date.now()}`,
                  rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor'
                });
              }
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // LCP não suportado
          }

          // First Contentful Paint (FCP)
          try {
            const fcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry) => {
                if (entry.name === 'first-contentful-paint') {
                  onWebVital({
                    name: 'FCP',
                    value: entry.startTime,
                    delta: entry.startTime,
                    id: `fcp-${Date.now()}`,
                    rating: entry.startTime <= 1800 ? 'good' : entry.startTime <= 3000 ? 'needs-improvement' : 'poor'
                  });
                }
              });
            });
            
            fcpObserver.observe({ entryTypes: ['paint'] });
          } catch (e) {
            // FCP não suportado
          }

          // Cumulative Layout Shift (CLS)
          try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  clsValue += (entry as any).value;
                }
              }
              
              onWebVital({
                name: 'CLS',
                value: clsValue,
                delta: clsValue,
                id: `cls-${Date.now()}`,
                rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
              });
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            // CLS não suportado
          }
        }

        // Time to First Byte (TTFB) usando Navigation Timing
        if (window.performance?.timing) {
          const timing = window.performance.timing;
          const ttfb = timing.responseStart - timing.navigationStart;
          
          if (ttfb > 0) {
            onWebVital({
              name: 'TTFB',
              value: ttfb,
              delta: ttfb,
              id: `ttfb-${Date.now()}`,
              rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor'
            });
          }
        }

      } catch (error) {
        logger.warn('Erro ao inicializar Web Vitals', { error });
      }
    };

    // Aguardar carregamento completo
    if (document.readyState === 'complete') {
      initWebVitals();
    } else {
      window.addEventListener('load', initWebVitals);
      return () => window.removeEventListener('load', initWebVitals);
    }
  }, [onWebVital]);

  return {
    onWebVital,
    getThreshold
  };
};

export default useWebVitals;
