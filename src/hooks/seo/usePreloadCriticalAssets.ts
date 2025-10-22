
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePreloadCriticalAssets = () => {
  const location = useLocation();

  useEffect(() => {
    // Preload critical fonts
    const preloadFont = (href: string, type: string = 'font/woff2') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = type;
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    // Preload critical images based on route
    const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.setAttribute('fetchpriority', priority);
      document.head.appendChild(link);
    };

    // Route-specific preloading can be added here in the future if needed

    // Preload next likely navigation targets based on current route
    const preloadNextRoute = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    };

    // Predictive preloading based on user journey patterns
    if (location.pathname === '/dashboard') {
      preloadNextRoute('/tools');
      preloadNextRoute('/learning');
    }

  }, [location.pathname]);
};
