
import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  reRenders: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: number;
  lastUpdate: Date;
}

interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
  type: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    reRenders: 0,
    networkRequests: 0,
    errors: 0,
    lastUpdate: new Date()
  });

  const renderStartRef = useRef<number>(0);
  const mountCountRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const networkCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);

  // Monitor performance entries
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let networkRequests = 0;

      entries.forEach((entry) => {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          networkRequests++;
        }
      });

      if (networkRequests > 0) {
        networkCountRef.current += networkRequests;
        updateMetrics();
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    } catch (error) {
      console.warn('Performance Observer não suportado:', error);
    }

    return () => observer.disconnect();
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize,
          lastUpdate: new Date()
        }));
      }
    };

    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Track component lifecycle
  useEffect(() => {
    mountCountRef.current++;
    renderStartRef.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartRef.current;
      renderCountRef.current++;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        componentMounts: mountCountRef.current,
        reRenders: renderCountRef.current,
        lastUpdate: new Date()
      }));
    };
  });

  const updateMetrics = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      networkRequests: networkCountRef.current,
      errors: errorCountRef.current,
      lastUpdate: new Date()
    }));
  }, []);

  const recordError = useCallback(() => {
    errorCountRef.current++;
    updateMetrics();
  }, [updateMetrics]);

  const markStart = useCallback((markName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${componentName}-${markName}-start`);
    }
  }, [componentName]);

  const markEnd = useCallback((markName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      const startMark = `${componentName}-${markName}-start`;
      const endMark = `${componentName}-${markName}-end`;
      
      performance.mark(endMark);
      performance.measure(
        `${componentName}-${markName}`,
        startMark,
        endMark
      );
    }
  }, [componentName]);

  const getPerformanceReport = useCallback((): string => {
    const report = {
      component: componentName,
      metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    return JSON.stringify(report, null, 2);
  }, [componentName, metrics]);

  const logPerformance = useCallback((level: 'info' | 'warn' | 'error' = 'info') => {
    const message = `[PERFORMANCE] ${componentName}`;
    const data = {
      renderTime: `${metrics.renderTime.toFixed(2)}ms`,
      mounts: metrics.componentMounts,
      reRenders: metrics.reRenders,
      networkRequests: metrics.networkRequests,
      errors: metrics.errors,
      memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    };

    switch (level) {
      case 'warn':
        console.warn(message, data);
        break;
      case 'error':
        console.error(message, data);
        break;
      default:
        console.log(message, data);
    }
  }, [componentName, metrics]);

  return {
    metrics,
    recordError,
    markStart,
    markEnd,
    getPerformanceReport,
    logPerformance
  };
};
