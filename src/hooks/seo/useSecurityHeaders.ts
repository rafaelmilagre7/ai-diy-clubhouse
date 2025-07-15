
import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set security-related meta tags
    const setSecurityMeta = () => {
      // Content Security Policy (meta tag version for additional protection)
      let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
      if (!cspMeta) {
        cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        document.head.appendChild(cspMeta);
      }
      cspMeta.setAttribute('content', 
        "default-src 'self' https:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.viverdeia.ai https://*.supabase.co; " +
        "style-src 'self' 'unsafe-inline' https:; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' https:; " +
        "connect-src 'self' https://*.supabase.co https://api.openai.com wss://*.supabase.co; " +
        "media-src 'self' https: blob:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';"
      );

      // X-Content-Type-Options
      let contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]') as HTMLMetaElement;
      if (!contentTypeMeta) {
        contentTypeMeta = document.createElement('meta');
        contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
        contentTypeMeta.setAttribute('content', 'nosniff');
        document.head.appendChild(contentTypeMeta);
      }

      // X-Frame-Options removido - não funciona como meta tag, deve ser HTTP header
      // Removendo qualquer meta tag X-Frame-Options existente para evitar conflitos
      let frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]') as HTMLMetaElement;
      if (frameMeta) {
        frameMeta.remove();
      }

      // Referrer Policy
      let referrerMeta = document.querySelector('meta[name="referrer"]') as HTMLMetaElement;
      if (!referrerMeta) {
        referrerMeta = document.createElement('meta');
        referrerMeta.setAttribute('name', 'referrer');
        referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
        document.head.appendChild(referrerMeta);
      }
    };

    setSecurityMeta();
  }, []);
};
