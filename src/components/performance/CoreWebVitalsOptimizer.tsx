
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

    // Implementar otimizações
    preloadCriticalResources();
    optimizeCriticalCSS();
    preventLayoutShifts();

    // Métricas de performance
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }

  }, []);

  return null; // Este componente não renderiza nada
};
