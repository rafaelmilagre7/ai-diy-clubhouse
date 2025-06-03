
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ImplementationTrail, TrailSolutionEnriched } from '@/types/implementation-trail';

export const useTrailSolutionsEnrichment = (trail: ImplementationTrail | null) => {
  const [enrichedSolutions, setEnrichedSolutions] = useState<TrailSolutionEnriched[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enrichSolutions = async () => {
      if (!trail) {
        setEnrichedSolutions([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Extrair todos os IDs de soluções das 3 prioridades
        const allSolutions = [
          ...trail.priority1.map(s => ({ ...s, priority: 1 })),
          ...trail.priority2.map(s => ({ ...s, priority: 2 })),
          ...trail.priority3.map(s => ({ ...s, priority: 3 }))
        ];

        if (allSolutions.length === 0) {
          setEnrichedSolutions([]);
          setIsLoading(false);
          return;
        }

        const solutionIds = allSolutions.map(s => s.solutionId);

        // Buscar dados completos das soluções
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select(`
            id,
            title,
            description,
            category,
            difficulty,
            thumbnail_url,
            tags,
            published
          `)
          .in('id', solutionIds)
          .eq('published', true);

        if (solutionsError) {
          console.error('Erro ao buscar soluções:', solutionsError);
          throw solutionsError;
        }

        if (!solutionsData || solutionsData.length === 0) {
          console.warn('Nenhuma solução encontrada para os IDs fornecidos');
          setEnrichedSolutions([]);
          setIsLoading(false);
          return;
        }

        // Enriquecer soluções com dados da trilha
        const enriched: TrailSolutionEnriched[] = allSolutions
          .map(trailSolution => {
            const solutionData = solutionsData.find(s => s.id === trailSolution.solutionId);
            
            if (!solutionData) {
              console.warn(`Solução não encontrada para ID: ${trailSolution.solutionId}`);
              return null;
            }

            return {
              ...trailSolution,
              id: solutionData.id,
              title: solutionData.title || 'Solução sem título',
              description: solutionData.description || 'Descrição não disponível',
              category: solutionData.category || 'Sem categoria',
              difficulty: solutionData.difficulty || 'medium',
              thumbnail_url: solutionData.thumbnail_url,
              tags: solutionData.tags || [],
              solution: solutionData
            };
          })
          .filter(Boolean) as TrailSolutionEnriched[];

        // Ordenar por prioridade
        enriched.sort((a, b) => (a.priority || 1) - (b.priority || 1));

        setEnrichedSolutions(enriched);
      } catch (err) {
        console.error('Erro ao enriquecer soluções da trilha:', err);
        setError('Erro ao carregar soluções recomendadas');
        setEnrichedSolutions([]);
      } finally {
        setIsLoading(false);
      }
    };

    enrichSolutions();
  }, [trail]);

  return {
    enrichedSolutions,
    isLoading,
    error
  };
};
