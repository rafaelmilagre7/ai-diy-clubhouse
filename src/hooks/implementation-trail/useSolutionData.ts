
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
          .select('id, title, description, thumbnail_url, category, difficulty')
          .in('id', solutionIds as any);

        if (error) {
          throw error;
        }

        const solutionsMap = (data as any)?.reduce((acc: any, solution: any) => {
          acc[solution.id] = solution;
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

  return { solutions, loading };
};
