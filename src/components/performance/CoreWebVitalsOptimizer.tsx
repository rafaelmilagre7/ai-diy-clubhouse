
import { useEffect } from 'react';

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

    // Métricas de performance nativas
    const initPerformanceMetrics = () => {
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP measurement not supported');
        }

        // FID (First Input Delay)
        try {
          const fidObserver = new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach((entry) => {
              console.log('FID:', entry.processingStart - entry.startTime);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID measurement not supported');
        }

        // CLS (Cumulative Layout Shift)
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                console.log('CLS:', clsValue);
              }
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS measurement not supported');
        }
      }
    };

    // Implementar otimizações
    preloadCriticalResources();
    optimizeCriticalCSS();
    preventLayoutShifts();
    initPerformanceMetrics();

  }, []);

  return null; // Este componente não renderiza nada
};
