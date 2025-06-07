import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG } from '@/config/app';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}

export const useDynamicSEO = (seoData: SEOData = {}) => {
  const location = useLocation();

  useEffect(() => {
    const {
      title,
      description,
      keywords,
      image,
      canonical,
      noindex = false
    } = seoData;

    // Update title
    if (title) {
      document.title = `${title} | Viver de IA Hub`;
    }

    // Update or create meta description
    const updateOrCreateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update or create meta property (for Open Graph)
    const updateOrCreateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update description
    if (description) {
      updateOrCreateMeta('description', description);
      updateOrCreateProperty('og:description', description);
      updateOrCreateProperty('twitter:description', description);
    }

    // Update keywords
    if (keywords) {
      updateOrCreateMeta('keywords', keywords);
    }

    // Update Open Graph title
    if (title) {
      updateOrCreateProperty('og:title', title);
      updateOrCreateProperty('twitter:title', title);
    }

    // Update image
    if (image) {
      updateOrCreateProperty('og:image', image);
      updateOrCreateProperty('twitter:image', image);
    }

    // Update canonical URL
    const currentUrl = `${APP_CONFIG.getAppDomain()}${location.pathname}`;
    const canonicalUrl = canonical || currentUrl;
    
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update Open Graph URL
    updateOrCreateProperty('og:url', canonicalUrl);

    // Update robots meta
    if (noindex) {
      updateOrCreateMeta('robots', 'noindex, nofollow');
    } else {
      updateOrCreateMeta('robots', 'index, follow');
    }

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      // Only reset title to default, keep other meta tags for better performance
      if (!title) {
        document.title = 'Viver de IA Hub';
      }
    };
  }, [seoData, location.pathname]);
};
