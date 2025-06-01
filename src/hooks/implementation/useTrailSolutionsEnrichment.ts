
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

        // Coletar todos os IDs das soluções
        const allSolutionIds = [
          ...(trail.priority1?.map(s => s.solutionId) || []),
          ...(trail.priority2?.map(s => s.solutionId) || []),
          ...(trail.priority3?.map(s => s.solutionId) || [])
        ];

        if (allSolutionIds.length === 0) {
          setEnrichedSolutions([]);
          return;
        }

        // Buscar detalhes das soluções
        const { data: solutions, error: solutionsError } = await supabase
          .from('solutions')
          .select('*')
          .in('id', allSolutionIds)
          .eq('published', true);

        if (solutionsError) {
          throw solutionsError;
        }

        // Criar mapa de soluções para acesso rápido
        const solutionsMap = new Map(solutions?.map(s => [s.id, s]) || []);

        // Enriquecer soluções com prioridades e justificativas
        const enriched: TrailSolutionEnriched[] = [];

        // Processar cada prioridade
        [
          { items: trail.priority1 || [], priority: 1 },
          { items: trail.priority2 || [], priority: 2 },
          { items: trail.priority3 || [], priority: 3 }
        ].forEach(({ items, priority }) => {
          items.forEach(trailSolution => {
            const solution = solutionsMap.get(trailSolution.solutionId);
            if (solution) {
              enriched.push({
                ...trailSolution,
                id: solution.id,
                title: solution.title,
                description: solution.description,
                thumbnail_url: solution.thumbnail_url,
                category: solution.category,
                difficulty: solution.difficulty,
                tags: solution.tags,
                solution: solution,
                priority
              });
            }
          });
        });

        setEnrichedSolutions(enriched);
        console.log('✅ Soluções enriquecidas:', enriched.length);

      } catch (err) {
        console.error('❌ Erro ao enriquecer soluções:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar soluções');
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
