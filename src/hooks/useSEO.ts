
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonical?: string;
  noindex?: boolean;
}

export const useSEO = (config: SEOConfig) => {
  const location = useLocation();

  useEffect(() => {
    // Atualizar título da página
    document.title = config.title;

    // Limpar meta tags existentes
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    // Função helper para criar meta tags
    const createMetaTag = (property: string, content: string, name?: string) => {
      const meta = document.createElement('meta');
      if (name) {
        meta.setAttribute('name', property);
      } else {
        meta.setAttribute('property', property);
      }
      meta.setAttribute('content', content);
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    };

    // Meta description
    createMetaTag('description', config.description, true);

    // Keywords (se fornecidas)
    if (config.keywords) {
      createMetaTag('keywords', config.keywords, true);
    }

    // Open Graph tags
    createMetaTag('og:title', config.title);
    createMetaTag('og:description', config.description);
    createMetaTag('og:type', config.type || 'website');
    createMetaTag('og:url', window.location.href);
    
    if (config.image) {
      createMetaTag('og:image', config.image);
      createMetaTag('og:image:alt', config.title);
    }

    // Twitter Cards
    createMetaTag('twitter:card', 'summary_large_image');
    createMetaTag('twitter:title', config.title);
    createMetaTag('twitter:description', config.description);
    createMetaTag('twitter:site', '@viverdeia');
    
    if (config.image) {
      createMetaTag('twitter:image', config.image);
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = config.canonical || window.location.href;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = config.canonical || window.location.href;
      document.head.appendChild(link);
    }

    // Robots meta tag
    if (config.noindex) {
      createMetaTag('robots', 'noindex, nofollow', true);
    } else {
      createMetaTag('robots', 'index, follow', true);
    }

  }, [config, location]);
};
