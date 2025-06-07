
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG } from '@/config/app';
import { generateBreadcrumbs } from '@/utils/slugify';

interface AdvancedSEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  tags?: string[];
  language?: string;
  alternateLanguages?: { lang: string; url: string }[];
}

export const useAdvancedSEO = (seoData: AdvancedSEOData = {}) => {
  const location = useLocation();

  useEffect(() => {
    const {
      title,
      description,
      keywords = [],
      author,
      publishedTime,
      modifiedTime,
      articleSection,
      tags = [],
      language = 'pt-BR',
      alternateLanguages = []
    } = seoData;

    // Update or create meta tags
    const updateOrCreateMeta = (name: string, content: string, attribute: string = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Language and locale
    if (language) {
      document.documentElement.lang = language;
      updateOrCreateMeta('og:locale', language, 'property');
    }

    // Author information
    if (author) {
      updateOrCreateMeta('author', author);
      updateOrCreateMeta('article:author', author, 'property');
    }

    // Published and modified times for articles
    if (publishedTime) {
      updateOrCreateMeta('article:published_time', publishedTime, 'property');
    }
    
    if (modifiedTime) {
      updateOrCreateMeta('article:modified_time', modifiedTime, 'property');
      updateOrCreateMeta('og:updated_time', modifiedTime, 'property');
    }

    // Article section
    if (articleSection) {
      updateOrCreateMeta('article:section', articleSection, 'property');
    }

    // Keywords - combine with tags
    const allKeywords = [...keywords, ...tags];
    if (allKeywords.length > 0) {
      updateOrCreateMeta('keywords', allKeywords.join(', '));
      
      // Add article tags
      allKeywords.forEach((tag, index) => {
        updateOrCreateMeta(`article:tag:${index}`, tag, 'property');
      });
    }

    // Alternate languages
    alternateLanguages.forEach(alt => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = alt.lang;
      link.href = alt.url;
      document.head.appendChild(link);
    });

    // Add breadcrumb structured data
    const breadcrumbs = generateBreadcrumbs(location.pathname);
    if (breadcrumbs.length > 1) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': crumb.name,
          'item': `${APP_CONFIG.getAppDomain()}${crumb.url}`
        }))
      };

      const scriptId = 'breadcrumb-schema';
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Remove breadcrumb schema when component unmounts
      const script = document.getElementById('breadcrumb-schema');
      if (script) {
        script.remove();
      }
      
      // Clean up alternate language links
      const altLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
      altLinks.forEach(link => link.remove());
    };
  }, [seoData, location.pathname]);
};
