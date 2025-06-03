
import { useCallback, useEffect, useRef } from 'react';
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
  const observersRef = useRef<PerformanceObserver[]>([]);
  const isInitializedRef = useRef(false);

  const onWebVital = useCallback((metric: WebVitalsMetric) => {
    try {
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
    } catch (error) {
      logger.error('Erro ao processar Web Vital', { metric: metric.name, error });
    }
  }, [captureMetric]);

  // Thresholds para Web Vitals
  const getThreshold = useCallback((name: string, rating: 'good' | 'poor') => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };
    
    return thresholds[name as keyof typeof thresholds]?.[rating] || 0;
  }, []);

  // Função segura para criar observers
  const createSafeObserver = useCallback((entryTypes: string[], callback: (list: PerformanceObserverEntryList) => void) => {
    try {
      if (!('PerformanceObserver' in window)) {
        logger.info('PerformanceObserver não suportado');
        return null;
      }

      const observer = new PerformanceObserver(callback);
      
      entryTypes.forEach(type => {
        try {
          observer.observe({ entryTypes: [type] });
        } catch (e) {
          // Tipo específico não suportado, continuar com outros
          logger.debug(`Entry type ${type} não suportado`);
        }
      });

      observersRef.current.push(observer);
      return observer;
    } catch (error) {
      logger.warn(`Erro ao criar observer para ${entryTypes.join(', ')}`, { error });
      return null;
    }
  }, []);

  // Cleanup function
  const cleanupObservers = useCallback(() => {
    observersRef.current.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        logger.debug('Erro ao desconectar observer', { error });
      }
    });
    observersRef.current = [];
  }, []);

  // Inicializar Web Vitals
  useEffect(() => {
    if (isInitializedRef.current || typeof window === 'undefined') return;
    
    const initWebVitals = async () => {
      try {
        if (!window.performance) {
          logger.info('Performance API não disponível');
          return;
        }

        // Largest Contentful Paint (LCP)
        createSafeObserver(['largest-contentful-paint'], (list) => {
          try {
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
          } catch (error) {
            logger.warn('Erro ao processar LCP', { error });
          }
        });

        // First Contentful Paint (FCP)
        createSafeObserver(['paint'], (list) => {
          try {
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
          } catch (error) {
            logger.warn('Erro ao processar FCP', { error });
          }
        });

        // Cumulative Layout Shift (CLS)
        createSafeObserver(['layout-shift'], (list) => {
          try {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            
            if (clsValue > 0) {
              onWebVital({
                name: 'CLS',
                value: clsValue,
                delta: clsValue,
                id: `cls-${Date.now()}`,
                rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
              });
            }
          } catch (error) {
            logger.warn('Erro ao processar CLS', { error });
          }
        });

        // Time to First Byte (TTFB) usando Navigation Timing
        if (window.performance?.timing) {
          try {
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
          } catch (error) {
            logger.warn('Erro ao processar TTFB', { error });
          }
        }

        isInitializedRef.current = true;

      } catch (error) {
        logger.error('Erro ao inicializar Web Vitals', { error });
      }
    };

    // Aguardar carregamento completo
    if (document.readyState === 'complete') {
      initWebVitals();
    } else {
      const handleLoad = () => {
        initWebVitals();
        window.removeEventListener('load', handleLoad);
      };
      window.addEventListener('load', handleLoad);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        cleanupObservers();
      };
    }

    return cleanupObservers;
  }, [onWebVital, createSafeObserver, cleanupObservers]);

  return {
    onWebVital,
    getThreshold
  };
};

export default useWebVitals;
