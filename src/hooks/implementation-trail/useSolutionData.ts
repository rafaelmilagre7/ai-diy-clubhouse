
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export interface SolutionData {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  tags?: string[];
}

export const useSolutionData = (solutionIds: string[]) => {
  const [solutions, setSolutions] = useState<Record<string, SolutionData>>({});
  const [loading, setLoading] = useState(false);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchSolutions = async () => {
      if (solutionIds.length === 0) return;

      try {
        setLoading(true);
        log('Buscando dados das soluções', { solutionIds });

        const { data, error } = await supabase
          .from('solutions')
          .select('id, title, description, thumbnail_url, category, difficulty, tags')
          .in('id', solutionIds);

        if (error) {
          throw error;
        }

        const solutionsMap = data?.reduce((acc, solution) => {
          acc[solution.id] = {
            ...solution,
            // Garantir que tags seja sempre um array
            tags: Array.isArray(solution.tags) ? solution.tags : []
          };
          return acc;
        }, {} as Record<string, SolutionData>) || {};

        setSolutions(solutionsMap);
        log('Dados das soluções carregados', { count: data?.length });

      } catch (error) {
        logError('Erro ao buscar dados das soluções', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [solutionIds.join(',')]);

  // Função para obter uma solução específica
  const getSolution = (solutionId: string): SolutionData | null => {
    return solutions[solutionId] || null;
  };

  // Função para obter soluções de uma categoria específica
  const getSolutionsByCategory = (category: string): SolutionData[] => {
    return Object.values(solutions).filter(solution => 
      solution.category === category
    );
  };

  // Função para obter soluções por dificuldade
  const getSolutionsByDifficulty = (difficulty: string): SolutionData[] => {
    return Object.values(solutions).filter(solution => 
      solution.difficulty === difficulty
    );
  };

  return { 
    solutions, 
    loading, 
    getSolution,
    getSolutionsByCategory,
    getSolutionsByDifficulty,
    totalSolutions: Object.keys(solutions).length
  };
};
