
import { useEffect } from 'react';

// Interfaces para tipagem segura das métricas
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// Type guards para verificação segura de tipos
const isPerformanceEventTiming = (entry: PerformanceEntry): entry is PerformanceEventTiming => {
  return 'processingStart' in entry && typeof (entry as any).processingStart === 'number';
};

const isLayoutShiftEntry = (entry: PerformanceEntry): entry is LayoutShiftEntry => {
  return 'value' in entry && 'hadRecentInput' in entry;
};

/**
 * Componente para otimizações de Core Web Vitals
 */
export const CoreWebVitalsOptimizer: React.FC = () => {
  useEffect(() => {
    // Preload de recursos críticos
    const preloadCriticalResources = () => {
      // Preload de fontes críticas
      const fonts = [
        '/fonts/inter.woff2',
        '/fonts/inter-bold.woff2'
      ];

      fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.href = font;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Preload de imagens críticas above-the-fold
      const criticalImages = [
        '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png' // Logo
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Otimizar CSS crítico
    const optimizeCriticalCSS = () => {
      // Inline CSS crítico para above-the-fold
      const criticalCSS = `
        .dashboard-header { opacity: 1; transform: none; }
        .solution-grid { contain: layout style paint; }
        .loading-skeleton { will-change: transform; }
      `;

      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
    };

    // Otimizar layout shifts
    const preventLayoutShifts = () => {
      // Adicionar aspect-ratio containers para imagens
      const style = document.createElement('style');
      style.textContent = `
        .aspect-video-container {
          aspect-ratio: 16 / 9;
          contain: layout;
        }
        .solution-card-image {
          aspect-ratio: 16 / 9;
          object-fit: cover;
          contain: layout;
        }
      `;
      document.head.appendChild(style);
    };

    // Métricas de performance nativas com verificações de segurança
    const initPerformanceMetrics = () => {
      if (!('PerformanceObserver' in window)) {
        console.warn('[CoreWebVitals] PerformanceObserver não suportado neste browser');
        return;
      }

      // LCP (Largest Contentful Paint) com verificação segura
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            if (lastEntry && typeof lastEntry.startTime === 'number') {
              console.log('[CoreWebVitals] LCP:', lastEntry.startTime.toFixed(2) + 'ms');
            }
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('[CoreWebVitals] LCP measurement não suportado:', error);
      }

      // FID (First Input Delay) com type guard seguro
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (isPerformanceEventTiming(entry)) {
              const fidValue = entry.processingStart - entry.startTime;
              if (typeof fidValue === 'number' && fidValue >= 0) {
                console.log('[CoreWebVitals] FID:', fidValue.toFixed(2) + 'ms');
              }
            } else {
              console.warn('[CoreWebVitals] FID entry não tem formato esperado');
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('[CoreWebVitals] FID measurement não suportado:', error);
      }

      // CLS (Cumulative Layout Shift) com type guard seguro
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (isLayoutShiftEntry(entry)) {
              if (!entry.hadRecentInput && typeof entry.value === 'number') {
                clsValue += entry.value;
                console.log('[CoreWebVitals] CLS:', clsValue.toFixed(4));
              }
            } else {
              console.warn('[CoreWebVitals] CLS entry não tem formato esperado');
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('[CoreWebVitals] CLS measurement não suportado:', error);
      }

      // TTFB (Time to First Byte) adicional para diagnóstico
      try {
        const ttfbObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              if (navEntry.responseStart && navEntry.requestStart) {
                const ttfb = navEntry.responseStart - navEntry.requestStart;
                console.log('[CoreWebVitals] TTFB:', ttfb.toFixed(2) + 'ms');
              }
            }
          });
        });
        
        ttfbObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('[CoreWebVitals] TTFB measurement não suportado:', error);
      }
    };

    // Implementar otimizações
    preloadCriticalResources();
    optimizeCriticalCSS();
    preventLayoutShifts();
    initPerformanceMetrics();

    // Cleanup function para observers
    return () => {
      // Note: PerformanceObserver.disconnect() seria chamado automaticamente
      // quando o componente for desmontado, mas adicionamos esta função
      // para garantir limpeza adequada se necessário
    };

  }, []);

  return null; // Este componente não renderiza nada
};
