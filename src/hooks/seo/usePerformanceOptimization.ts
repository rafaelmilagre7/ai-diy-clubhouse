
import { useEffect } from 'react';

export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Enable resource hints
    const addResourceHint = (rel: string, href: string, as?: string) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (as) link.as = as;
      document.head.appendChild(link);
    };

    // Preconnect to critical font origins (breaks dependency chain)
    addResourceHint('preconnect', 'https://fonts.googleapis.com');
    addResourceHint('preconnect', 'https://fonts.gstatic.com');
    
    // DNS prefetch for other external domains
    addResourceHint('dns-prefetch', 'https://api.openai.com');
    
    // Preconnect to critical resources
    addResourceHint('preconnect', 'https://zotzvtepvpnkcoobdubt.supabase.co');

    // Set viewport meta for mobile optimization
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');

    // Add theme-color meta for better mobile experience
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      themeColorMeta.setAttribute('content', '#1A1E2E');
      document.head.appendChild(themeColorMeta);
    }

    // Add manifest link if it doesn't exist
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    // Image lazy-loading is handled by React and browser native lazy loading

    // Critical resource loading optimization
    const optimizeCriticalResources = () => {
      // Mark critical CSS as high priority
      const criticalStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      criticalStylesheets.forEach((stylesheet, index) => {
        if (index < 2) { // First 2 stylesheets are usually critical
          (stylesheet as HTMLLinkElement).setAttribute('fetchpriority', 'high');
        }
      });
    };

    optimizeCriticalResources();

  }, []);
};
