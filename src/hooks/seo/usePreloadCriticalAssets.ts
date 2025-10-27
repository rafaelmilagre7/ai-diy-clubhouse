
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

    // Preload critical logo image for LCP optimization
    preloadImage('/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png', 'high');

    // Preload critical fonts to break dependency chain
    const preloadCriticalFonts = () => {
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'style';
      fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(fontPreload);
    };
    
    preloadCriticalFonts();

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
