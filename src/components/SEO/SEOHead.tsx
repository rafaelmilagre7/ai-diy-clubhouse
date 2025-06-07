
import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import { seoConfigs, baseSEO, PageSEO } from '@/utils/seoConfig';

interface SEOHeadProps {
  page?: keyof typeof seoConfigs;
  customSEO?: Partial<PageSEO>;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  page, 
  customSEO,
  noindex = false 
}) => {
  // Buscar configuração da página ou usar customSEO
  const pageConfig = page ? seoConfigs[page] : null;
  const seoConfig = customSEO || pageConfig;

  if (!seoConfig) {
    console.warn('SEO config not found for page:', page);
    return null;
  }

  // Construir configuração final
  const finalConfig = {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    type: seoConfig.type || 'website',
    image: seoConfig.image || `${baseSEO.baseUrl}${baseSEO.defaultImage}`,
    noindex
  };

  // Usar o hook para aplicar as meta tags
  useSEO(finalConfig);

  return null; // Este componente não renderiza nada visível
};

export default SEOHead;
