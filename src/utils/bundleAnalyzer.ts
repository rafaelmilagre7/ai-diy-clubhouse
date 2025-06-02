
interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  recommendations: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  type: 'vendor' | 'page' | 'shared';
  modules: string[];
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private loadTimes: Map<string, number> = new Map();
  private chunkSizes: Map<string, number> = new Map();

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  // Analisar performance de carregamento
  analyzeLoadPerformance(): void {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      // Métricas principais
      const metrics = {
        firstContentfulPaint: this.getFCP(),
        largestContentfulPaint: this.getLCP(),
        firstInputDelay: this.getFID(),
        cumulativeLayoutShift: this.getCLS(),
        totalBlockingTime: this.getTBT(),
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
      };

      // Analisar recursos
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const imageResources = resources.filter(r => r.initiatorType === 'img');

      console.group('📊 Bundle Performance Analysis');
      console.table(metrics);
      console.log('📦 JavaScript bundles:', jsResources.length);
      console.log('🎨 CSS files:', cssResources.length);
      console.log('🖼️ Images:', imageResources.length);
      
      // Identificar bundles grandes
      const largeBundles = jsResources.filter(r => r.transferSize > 500000); // > 500KB
      if (largeBundles.length > 0) {
        console.warn('⚠️ Large bundles detected:', largeBundles.map(r => ({
          name: r.name,
          size: `${(r.transferSize / 1024).toFixed(2)}KB`
        })));
      }

      console.groupEnd();

      // Salvar métricas para análise
      this.saveMetrics(metrics);
    }
  }

  // Rastrear carregamento de chunks
  trackChunkLoad(chunkName: string, startTime: number, endTime: number): void {
    const loadTime = endTime - startTime;
    this.loadTimes.set(chunkName, loadTime);
    
    if (loadTime > 3000) { // > 3 segundos
      console.warn(`🐌 Slow chunk loading: ${chunkName} took ${loadTime}ms`);
    }
  }

  // Analisar tamanho dos chunks
  analyzeChunkSizes(): BundleAnalysis {
    const chunks: ChunkInfo[] = [];
    let totalSize = 0;
    const recommendations: string[] = [];

    // Simular análise de chunks (em produção, isso viria do build)
    this.chunkSizes.forEach((size, name) => {
      totalSize += size;
      
      const chunkInfo: ChunkInfo = {
        name,
        size,
        type: this.getChunkType(name),
        modules: [], // Em produção, seria populado com módulos reais
      };
      
      chunks.push(chunkInfo);
      
      // Gerar recomendações
      if (size > 1000000) { // > 1MB
        recommendations.push(`Consider splitting ${name} chunk (${(size / 1024 / 1024).toFixed(2)}MB)`);
      }
    });

    // Ordenar chunks por tamanho
    chunks.sort((a, b) => b.size - a.size);

    return {
      totalSize,
      gzippedSize: totalSize * 0.3, // Estimativa de compressão gzip
      chunks,
      recommendations,
    };
  }

  // Métricas Core Web Vitals
  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLCP(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getFID(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0];
          resolve(firstInput.processingStart - firstInput.startTime);
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getCLS(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getTBT(): number {
    // Simplificado - em produção seria mais complexo
    const longTasks = performance.getEntriesByType('longtask');
    return longTasks.reduce((tbt, task) => {
      return tbt + Math.max(0, task.duration - 50);
    }, 0);
  }

  private getChunkType(chunkName: string): 'vendor' | 'page' | 'shared' {
    if (chunkName.includes('vendor')) return 'vendor';
    if (chunkName.includes('page') || chunkName.includes('route')) return 'page';
    return 'shared';
  }

  private saveMetrics(metrics: any): void {
    // Salvar métricas localmente para análise
    try {
      const existingMetrics = JSON.parse(localStorage.getItem('bundleMetrics') || '[]');
      existingMetrics.push({
        timestamp: Date.now(),
        ...metrics,
      });
      
      // Manter apenas os últimos 50 registros
      if (existingMetrics.length > 50) {
        existingMetrics.splice(0, existingMetrics.length - 50);
      }
      
      localStorage.setItem('bundleMetrics', JSON.stringify(existingMetrics));
    } catch (error) {
      console.warn('Could not save bundle metrics:', error);
    }
  }

  // Relatório de performance
  generateReport(): void {
    const analysis = this.analyzeChunkSizes();
    
    console.group('📈 Bundle Analysis Report');
    console.log(`Total bundle size: ${(analysis.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Estimated gzipped: ${(analysis.gzippedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Number of chunks: ${analysis.chunks.length}`);
    
    if (analysis.recommendations.length > 0) {
      console.group('💡 Recommendations');
      analysis.recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

// Hook para usar o analisador
export const useBundleAnalyzer = () => {
  const analyzer = BundleAnalyzer.getInstance();
  
  return {
    analyzePerformance: () => analyzer.analyzeLoadPerformance(),
    generateReport: () => analyzer.generateReport(),
    trackChunkLoad: (name: string, start: number, end: number) => 
      analyzer.trackChunkLoad(name, start, end),
  };
};
