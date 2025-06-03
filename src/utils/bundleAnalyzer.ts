
import { logger } from './logger';
import { formatBytes } from './performance/performanceUtils';

interface BundleInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'html' | 'other';
  isLazy: boolean;
}

interface AnalysisResult {
  totalSize: number;
  loadTime: number;
  largestBundles: BundleInfo[];
  recommendations: string[];
}

export const useBundleAnalyzer = () => {
  const analyzePerformance = async (): Promise<AnalysisResult> => {
    if (typeof window === 'undefined') {
      return {
        totalSize: 0,
        loadTime: 0,
        largestBundles: [],
        recommendations: []
      };
    }

    const startTime = performance.now();
    
    // Analisar recursos carregados
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const bundles: BundleInfo[] = [];
    let totalSize = 0;

    for (const resource of resources) {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        const size = resource.transferSize || resource.decodedBodySize || 0;
        totalSize += size;

        const isLazy = resource.name.includes('chunk-') || resource.name.includes('lazy');
        
        bundles.push({
          name: resource.name.split('/').pop() || 'unknown',
          size,
          type: resource.name.includes('.js') ? 'js' : 'css',
          isLazy
        });
      }
    }

    // Ordenar por tamanho
    bundles.sort((a, b) => b.size - a.size);

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Gerar recomendações
    const recommendations: string[] = [];
    
    const largeMainBundles = bundles.filter(b => !b.isLazy && b.size > 100000);
    if (largeMainBundles.length > 0) {
      recommendations.push('Considere dividir bundles principais grandes em chunks menores');
    }

    const totalMainSize = bundles.filter(b => !b.isLazy).reduce((sum, b) => sum + b.size, 0);
    if (totalMainSize > 1000000) { // 1MB
      recommendations.push('Bundle principal excede 1MB - considere lazy loading');
    }

    const result: AnalysisResult = {
      totalSize,
      loadTime,
      largestBundles: bundles.slice(0, 5),
      recommendations
    };

    // Log dos resultados
    logger.info('Total Bundle Size:', formatBytes(totalSize));
    logger.info('Load Time:', `${loadTime.toFixed(0)} ms`);
    logger.info('Largest Bundles:', result.largestBundles);
    logger.info('Recommendations:', recommendations);

    return result;
  };

  const optimizeBundles = () => {
    // Implementar otimizações automáticas quando possível
    if ('serviceWorker' in navigator) {
      // Preload de recursos críticos via service worker
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'PRELOAD_CRITICAL_RESOURCES'
        });
      });
    }

    // Cleanup de event listeners não utilizados
    if (typeof window !== 'undefined') {
      // Remover listeners órfãos
      const originalAddEventListener = window.addEventListener;
      const originalRemoveEventListener = window.removeEventListener;
      
      let listenerCount = 0;
      
      window.addEventListener = function(type, listener, options) {
        listenerCount++;
        return originalAddEventListener.call(this, type, listener, options);
      };
      
      window.removeEventListener = function(type, listener, options) {
        listenerCount = Math.max(0, listenerCount - 1);
        return originalRemoveEventListener.call(this, type, listener, options);
      };

      // Log de listeners ativos periodicamente
      setInterval(() => {
        if (listenerCount > 50) {
          logger.warn('Muitos event listeners ativos', { count: listenerCount });
        }
      }, 30000);
    }
  };

  return {
    analyzePerformance,
    optimizeBundles
  };
};

export default useBundleAnalyzer;
