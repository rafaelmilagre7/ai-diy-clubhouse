
import { useState, useEffect } from 'react';
import { ImplementationTrail, TrailSolutionEnriched } from '@/types/implementation-trail';
import { supabase } from '@/integrations/supabase/client';

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

        // Coletar todos os IDs de soluções
        const allSolutionIds = [
          ...trail.priority1.map(s => s.solutionId),
          ...trail.priority2.map(s => s.solutionId),
          ...trail.priority3.map(s => s.solutionId)
        ];

        if (allSolutionIds.length === 0) {
          setEnrichedSolutions([]);
          return;
        }

        // Buscar detalhes das soluções
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('*')
          .in('id', allSolutionIds)
          .eq('published', true);

        if (solutionsError) {
          throw solutionsError;
        }

        // Enriquecer com dados da trilha
        const enriched: TrailSolutionEnriched[] = [];

        // Processar prioridade 1
        trail.priority1.forEach(trailSolution => {
          const solution = solutionsData?.find(s => s.id === trailSolution.solutionId);
          if (solution) {
            enriched.push({
              ...trailSolution,
              ...solution,
              priority: 1
            });
          }
        });

        // Processar prioridade 2
        trail.priority2.forEach(trailSolution => {
          const solution = solutionsData?.find(s => s.id === trailSolution.solutionId);
          if (solution) {
            enriched.push({
              ...trailSolution,
              ...solution,
              priority: 2
            });
          }
        });

        // Processar prioridade 3
        trail.priority3.forEach(trailSolution => {
          const solution = solutionsData?.find(s => s.id === trailSolution.solutionId);
          if (solution) {
            enriched.push({
              ...trailSolution,
              ...solution,
              priority: 3
            });
          }
        });

        setEnrichedSolutions(enriched);
      } catch (err) {
        console.error('Erro ao enriquecer soluções da trilha:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
