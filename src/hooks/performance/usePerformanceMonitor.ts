
import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentMounts: number;
  lastUpdate: Date;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Simular métricas básicas
    const updateMetrics = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics({
        renderTime: Math.round(renderTime * 100) / 100,
        memoryUsage: Math.random() * 50 + 20, // MB simulado
        componentMounts: metrics.componentMounts + 1,
        lastUpdate: new Date()
      });
    };

    // Atualizar após um pequeno delay
    const timer = setTimeout(updateMetrics, 100);
    
    return () => clearTimeout(timer);
  }, [componentName]);

  return { metrics };
};
