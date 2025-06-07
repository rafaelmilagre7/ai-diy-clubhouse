
import { useEffect } from 'react';

export const useAdvancedHeaders = () => {
  useEffect(() => {
    const addMetaHeader = (httpEquiv: string, content: string) => {
      let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('http-equiv', httpEquiv);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const addMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Cache control for better performance
    addMetaHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    // Security headers
    addMetaHeader('X-DNS-Prefetch-Control', 'on');
    addMetaHeader('X-Download-Options', 'noopen');
    addMetaHeader('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Performance hints
    addMetaName('format-detection', 'telephone=no, email=no, address=no');
    addMetaName('msapplication-tap-highlight', 'no');
    addMetaName('apple-mobile-web-app-capable', 'yes');
    addMetaName('apple-mobile-web-app-status-bar-style', 'black-translucent');
    
    // SEO optimization
    addMetaName('revisit-after', '7 days');
    addMetaName('distribution', 'global');
    addMetaName('rating', 'general');
    
    // Social media optimization
    addMetaName('twitter:dnt', 'on');
    addMetaName('pinterest-rich-pin', 'true');
    
    // Performance and accessibility
    addMetaName('color-scheme', 'dark light');
    addMetaName('supported-color-schemes', 'dark light');

    console.log('[SEO] Advanced headers configurados');
  }, []);
};
