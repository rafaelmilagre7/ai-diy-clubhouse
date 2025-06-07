
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSEO } from './useSEO';
import { seoConfigs, generateSolutionSEO, generateToolSEO, baseSEO } from '@/utils/seoConfig';

interface AdvancedSEOOptions {
  category?: string;
  difficulty?: string;
  tags?: string[];
  dynamicData?: any;
  enableAnalytics?: boolean;
}

export const useAdvancedSEO = (
  baseConfig: any,
  options: AdvancedSEOOptions = {}
) => {
  const location = useLocation();
  const { category, difficulty, tags, dynamicData, enableAnalytics = true } = options;

  // Gerar configuração SEO otimizada baseada no contexto
  const optimizedConfig = useMemo(() => {
    if (!baseConfig) return null;

    let config = { ...baseConfig };

    // Otimização por categoria
    if (category) {
      const categoryKeywords = {
        'Receita': 'aumentar receita, vendas IA, marketing automatizado',
        'Operacional': 'otimizar processos, automação operacional, eficiência',
        'Estratégia': 'estratégia IA, decisões data-driven, crescimento exponencial'
      };

      const categoryDescriptions = {
        'Receita': 'Aumente sua receita com soluções de IA testadas e aprovadas',
        'Operacional': 'Otimize operações e reduza custos com automação inteligente',
        'Estratégia': 'Acelere crescimento com estratégias de IA data-driven'
      };

      if (categoryKeywords[category as keyof typeof categoryKeywords]) {
        config.keywords = `${config.keywords}, ${categoryKeywords[category as keyof typeof categoryKeywords]}`;
        config.description = categoryDescriptions[category as keyof typeof categoryDescriptions] + '. ' + config.description;
      }
    }

    // Otimização por dificuldade
    if (difficulty) {
      const difficultyModifiers = {
        'easy': 'fácil implementação, iniciante, sem complexidade',
        'medium': 'implementação intermediária, resultado rápido',
        'advanced': 'avançado, especialista, máximo resultado'
      };

      if (difficultyModifiers[difficulty as keyof typeof difficultyModifiers]) {
        config.keywords += `, ${difficultyModifiers[difficulty as keyof typeof difficultyModifiers]}`;
      }
    }

    // Adicionar tags como keywords
    if (tags && tags.length > 0) {
      config.keywords += `, ${tags.join(', ')}`;
    }

    // Adicionar dados dinâmicos ao título/descrição
    if (dynamicData) {
      if (dynamicData.implementationCount) {
        config.description += ` Já implementado por +${dynamicData.implementationCount} empresários.`;
      }
      if (dynamicData.successRate) {
        config.description += ` Taxa de sucesso: ${dynamicData.successRate}%.`;
      }
    }

    return config;
  }, [baseConfig, category, difficulty, tags, dynamicData]);

  // Aplicar SEO otimizado
  useSEO(optimizedConfig || baseConfig);

  // Analytics SEO
  useEffect(() => {
    if (!enableAnalytics || !optimizedConfig) return;

    // Rastrear dados SEO para analytics
    const seoAnalytics = {
      page: location.pathname,
      title: optimizedConfig.title,
      keywords: optimizedConfig.keywords,
      category: category || 'general',
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for analytics
    const existingData = JSON.parse(localStorage.getItem('seo_analytics') || '[]');
    existingData.push(seoAnalytics);
    
    // Manter apenas os últimos 100 registros
    if (existingData.length > 100) {
      existingData.shift();
    }
    
    localStorage.setItem('seo_analytics', JSON.stringify(existingData));
  }, [location.pathname, optimizedConfig, category, enableAnalytics]);

  return {
    config: optimizedConfig,
    keywords: optimizedConfig?.keywords?.split(', ') || [],
    isOptimized: !!optimizedConfig
  };
};
