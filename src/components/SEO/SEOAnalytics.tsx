
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOAnalyticsProps {
  title?: string;
  category?: string;
  tags?: string[];
  userRole?: string;
}

export const SEOAnalytics: React.FC<SEOAnalyticsProps> = ({
  title,
  category,
  tags = [],
  userRole
}) => {
  const location = useLocation();

  useEffect(() => {
    // Rastrear métricas de SEO
    const trackSEOMetrics = () => {
      const metrics = {
        page: location.pathname,
        title: title || document.title,
        category: category || 'general',
        tags: tags,
        userRole: userRole || 'anonymous',
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        searchParams: Object.fromEntries(new URLSearchParams(location.search))
      };

      // Salvar no localStorage para análise posterior
      const seoMetrics = JSON.parse(localStorage.getItem('seo_metrics') || '[]');
      seoMetrics.push(metrics);
      
      // Manter apenas os últimos 200 registros
      if (seoMetrics.length > 200) {
        seoMetrics.splice(0, seoMetrics.length - 200);
      }
      
      localStorage.setItem('seo_metrics', JSON.stringify(seoMetrics));

      // Simular envio para analytics (em produção, seria Google Analytics 4)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view_seo', {
          page_path: location.pathname,
          page_title: title,
          content_category: category,
          custom_tags: tags.join(',')
        });
      }
    };

    // Delay para garantir que o DOM foi atualizado
    const timeoutId = setTimeout(trackSEOMetrics, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, title, category, tags, userRole]);

  // Rastrear tempo na página
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Date.now() - startTime;
      
      // Salvar métricas de engajamento
      const engagementMetrics = JSON.parse(localStorage.getItem('engagement_metrics') || '[]');
      engagementMetrics.push({
        page: location.pathname,
        timeSpent: timeSpent,
        category: category,
        timestamp: new Date().toISOString()
      });

      if (engagementMetrics.length > 100) {
        engagementMetrics.shift();
      }

      localStorage.setItem('engagement_metrics', JSON.stringify(engagementMetrics));
    };
  }, [location.pathname, category]);

  return null; // Componente invisível
};

// Hook para acessar métricas SEO
export const useSEOMetrics = () => {
  const getSEOMetrics = () => {
    return JSON.parse(localStorage.getItem('seo_metrics') || '[]');
  };

  const getEngagementMetrics = () => {
    return JSON.parse(localStorage.getItem('engagement_metrics') || '[]');
  };

  const getTopPages = () => {
    const metrics = getSEOMetrics();
    const pageViews: Record<string, number> = {};
    
    metrics.forEach((metric: any) => {
      pageViews[metric.page] = (pageViews[metric.page] || 0) + 1;
    });

    return Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };

  const getTopCategories = () => {
    const metrics = getSEOMetrics();
    const categories: Record<string, number> = {};
    
    metrics.forEach((metric: any) => {
      if (metric.category && metric.category !== 'general') {
        categories[metric.category] = (categories[metric.category] || 0) + 1;
      }
    });

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getAverageTimeSpent = () => {
    const metrics = getEngagementMetrics();
    if (metrics.length === 0) return 0;
    
    const totalTime = metrics.reduce((sum: number, metric: any) => sum + metric.timeSpent, 0);
    return Math.round(totalTime / metrics.length / 1000); // em segundos
  };

  return {
    getSEOMetrics,
    getEngagementMetrics,
    getTopPages,
    getTopCategories,
    getAverageTimeSpent
  };
};
