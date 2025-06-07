
import { useMemo } from 'react';
import { Solution } from '@/lib/supabase';

interface LinkSuggestion {
  url: string;
  title: string;
  reason: string;
  category: string;
  relevanceScore: number;
}

export const useInternalLinking = (
  currentItem: any,
  allSolutions: Solution[] = [],
  allTools: any[] = []
) => {
  const suggestions = useMemo(() => {
    if (!currentItem) return [];

    const links: LinkSuggestion[] = [];

    // Sugestões baseadas na categoria
    if (currentItem.category) {
      const relatedSolutions = allSolutions
        .filter(solution => 
          solution.category === currentItem.category && 
          solution.id !== currentItem.id
        )
        .slice(0, 3);

      relatedSolutions.forEach(solution => {
        links.push({
          url: `/solution/${solution.id}`,
          title: solution.title,
          reason: `Mesma categoria: ${solution.category}`,
          category: 'solution',
          relevanceScore: 0.8
        });
      });
    }

    // Sugestões baseadas em tags/palavras-chave
    if (currentItem.tags && Array.isArray(currentItem.tags)) {
      const tagMatches = allSolutions.filter(solution => {
        if (!solution.tags || solution.id === currentItem.id) return false;
        return solution.tags.some(tag => currentItem.tags.includes(tag));
      }).slice(0, 2);

      tagMatches.forEach(solution => {
        links.push({
          url: `/solution/${solution.id}`,
          title: solution.title,
          reason: 'Tags relacionadas',
          category: 'solution',
          relevanceScore: 0.6
        });
      });
    }

    // Sugestões baseadas na dificuldade
    if (currentItem.difficulty) {
      const progression = {
        'easy': 'medium',
        'medium': 'advanced',
        'advanced': 'medium'
      };

      const nextLevel = progression[currentItem.difficulty as keyof typeof progression];
      if (nextLevel) {
        const nextLevelSolutions = allSolutions
          .filter(solution => 
            solution.difficulty === nextLevel && 
            solution.category === currentItem.category
          )
          .slice(0, 2);

        nextLevelSolutions.forEach(solution => {
          links.push({
            url: `/solution/${solution.id}`,
            title: solution.title,
            reason: `Próximo nível: ${nextLevel}`,
            category: 'solution',
            relevanceScore: 0.7
          });
        });
      }
    }

    // Ferramentas relacionadas
    const relatedTools = allTools
      .filter(tool => tool.category === currentItem.category)
      .slice(0, 2);

    relatedTools.forEach(tool => {
      links.push({
        url: `/tools#${tool.id}`,
        title: tool.name,
        reason: 'Ferramenta recomendada',
        category: 'tool',
        relevanceScore: 0.5
      });
    });

    // Links para categorias principais
    if (currentItem.category) {
      links.push({
        url: `/solutions?category=${currentItem.category}`,
        title: `Todas as Soluções de ${currentItem.category}`,
        reason: 'Explorar categoria',
        category: 'category',
        relevanceScore: 0.4
      });
    }

    // Ordenar por relevância e retornar top 5
    return links
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

  }, [currentItem, allSolutions, allTools]);

  const generateBreadcrumbs = (currentPath: string) => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', url: '/' }];

    let currentUrl = '';
    pathSegments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      
      const names = {
        'solutions': 'Soluções',
        'tools': 'Ferramentas',
        'learning': 'Aprendizado',
        'community': 'Comunidade',
        'dashboard': 'Dashboard'
      };

      breadcrumbs.push({
        name: names[segment as keyof typeof names] || segment,
        url: currentUrl
      });
    });

    return breadcrumbs;
  };

  return {
    suggestions,
    generateBreadcrumbs
  };
};
