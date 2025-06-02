
import { useCallback, useRef } from 'react';

interface BundleInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'other';
  isLazy?: boolean;
}

interface PerformanceAnalysis {
  totalBundleSize: number;
  largestBundles: BundleInfo[];
  unusedCode: string[];
  recommendations: string[];
  loadTime: number;
  resourceTiming: PerformanceResourceTiming[];
}

export const useBundleAnalyzer = () => {
  const analysisCache = useRef<Map<string, PerformanceAnalysis>>(new Map());

  const analyzePerformance = useCallback((): PerformanceAnalysis => {
    try {
      const now = performance.now();
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Analisar bundles JavaScript e CSS
      const bundles: BundleInfo[] = [];
      let totalSize = 0;

      resources.forEach((resource) => {
        if (resource.name.includes('/assets/') || resource.name.includes('.js') || resource.name.includes('.css')) {
          const size = resource.transferSize || resource.encodedBodySize || 0;
          const isLazy = resource.name.includes('lazy') || resource.name.includes('chunk');
          
          let type: 'js' | 'css' | 'other' = 'other';
          if (resource.name.includes('.js')) type = 'js';
          if (resource.name.includes('.css')) type = 'css';

          bundles.push({
            name: resource.name.split('/').pop() || resource.name,
            size,
            type,
            isLazy
          });
          
          totalSize += size;
        }
      });

      // Ordenar por tamanho (maiores primeiro)
      const largestBundles = bundles
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);

      // Gerar recomendações
      const recommendations: string[] = [];
      
      // Bundle muito grande
      if (totalSize > 2000000) { // 2MB
        recommendations.push('Bundle total muito grande (>2MB). Considere code splitting.');
      }
      
      // Bundles individuais grandes
      largestBundles.forEach(bundle => {
        if (bundle.size > 500000 && !bundle.isLazy) { // 500KB
          recommendations.push(`Bundle ${bundle.name} é muito grande (${(bundle.size / 1024).toFixed(0)}KB). Considere lazy loading.`);
        }
      });

      // Tempo de carregamento
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      if (loadTime > 3000) {
        recommendations.push('Tempo de carregamento lento (>3s). Otimize recursos críticos.');
      }

      // Recursos não otimizados
      const unoptimizedResources = resources.filter(resource => {
        // Verificar se imagens não estão comprimidas
        if (resource.name.includes('.jpg') || resource.name.includes('.png')) {
          const compressionRatio = (resource.transferSize || 0) / (resource.decodedBodySize || 1);
          return compressionRatio > 0.8; // Baixa compressão
        }
        return false;
      });

      if (unoptimizedResources.length > 0) {
        recommendations.push(`${unoptimizedResources.length} imagens podem ser melhor comprimidas.`);
      }

      // Detectar código não utilizado (aproximação)
      const unusedCode: string[] = [];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      
      // Análise básica de uso vs tamanho
      jsResources.forEach(resource => {
        if (resource.transferSize && resource.transferSize > 100000) { // >100KB
          // Se é um bundle grande mas carregou muito rápido, pode ter código não usado
          const loadSpeed = resource.transferSize / (resource.duration || 1);
          if (loadSpeed > 10000) { // Carregou muito rápido para o tamanho
            unusedCode.push(resource.name.split('/').pop() || resource.name);
          }
        }
      });

      const analysis: PerformanceAnalysis = {
        totalBundleSize: totalSize,
        largestBundles,
        unusedCode,
        recommendations,
        loadTime,
        resourceTiming: resources
      };

      // Cache do resultado
      const cacheKey = `analysis_${Date.now()}`;
      analysisCache.current.set(cacheKey, analysis);

      // Log dos resultados em desenvolvimento
      if (import.meta.env.DEV) {
        console.group('📊 Bundle Analysis');
        console.log('Total Bundle Size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
        console.log('Load Time:', loadTime.toFixed(0), 'ms');
        console.log('Largest Bundles:', largestBundles.slice(0, 5));
        console.log('Recommendations:', recommendations);
        if (unusedCode.length > 0) {
          console.log('Potential Unused Code:', unusedCode);
        }
        console.groupEnd();
      }

      return analysis;

    } catch (error) {
      console.error('Erro na análise de performance:', error);
      
      // Retorno fallback
      return {
        totalBundleSize: 0,
        largestBundles: [],
        unusedCode: [],
        recommendations: ['Erro ao analisar performance'],
        loadTime: 0,
        resourceTiming: []
      };
    }
  }, []);

  const generateOptimizationReport = useCallback(() => {
    const analysis = analyzePerformance();
    
    const report = {
      summary: {
        bundleSize: `${(analysis.totalBundleSize / 1024 / 1024).toFixed(2)} MB`,
        loadTime: `${analysis.loadTime.toFixed(0)} ms`,
        optimizationOpportunities: analysis.recommendations.length
      },
      details: {
        largestBundles: analysis.largestBundles.map(bundle => ({
          name: bundle.name,
          size: `${(bundle.size / 1024).toFixed(0)} KB`,
          type: bundle.type,
          lazy: bundle.isLazy
        })),
        recommendations: analysis.recommendations,
        unusedCode: analysis.unusedCode
      },
      score: calculatePerformanceScore(analysis)
    };

    return report;
  }, [analyzePerformance]);

  const calculatePerformanceScore = (analysis: PerformanceAnalysis): number => {
    let score = 100;
    
    // Penalizar por tamanho do bundle
    if (analysis.totalBundleSize > 2000000) score -= 20; // >2MB
    else if (analysis.totalBundleSize > 1000000) score -= 10; // >1MB
    
    // Penalizar por tempo de carregamento
    if (analysis.loadTime > 5000) score -= 30; // >5s
    else if (analysis.loadTime > 3000) score -= 15; // >3s
    else if (analysis.loadTime > 1000) score -= 5; // >1s
    
    // Penalizar por código não utilizado
    score -= analysis.unusedCode.length * 5;
    
    // Penalizar por bundles grandes não-lazy
    const largeBundles = analysis.largestBundles.filter(b => b.size > 500000 && !b.isLazy);
    score -= largeBundles.length * 10;
    
    return Math.max(0, Math.min(100, score));
  };

  return {
    analyzePerformance,
    generateOptimizationReport
  };
};
