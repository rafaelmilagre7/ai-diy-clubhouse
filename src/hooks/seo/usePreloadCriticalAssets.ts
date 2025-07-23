
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

    // Route-specific preloading otimizado

    // Route-specific preloading - apenas para dashboard e home
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        // Verificar se recursos existem antes de preload com timeout curto
        const checkAndPreload = async (url: string, priority: 'high' | 'low' = 'high') => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout
            
            const response = await fetch(url, { 
              method: 'HEAD',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              preloadImage(url, priority);
            }
          } catch (error) {
            // Silenciar erros de preload para não poluir console
          }
        };

        // Fazer verificações em paralelo sem await para não bloquear
        checkAndPreload('/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png', 'high');
        checkAndPreload('/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png', 'low');
        break;
      
      case '/tools':
        // Preload common tool icons or placeholder images
        break;
      
      case '/learning':
        // Preload learning-related assets
        break;
    }

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
