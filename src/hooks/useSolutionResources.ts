
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export interface SolutionResource {
  id: string;
  solution_id: string;
  name: string;
  description?: string;
  url: string;
  file_type: string;
  file_size?: number;
  order_index: number;
  created_at: string;
}

export const useSolutionResources = (solutionId: string) => {
  const { log, logError } = useLogging();

  const { data: resources = [], isLoading: loading, error } = useQuery({
    queryKey: ['solution-resources', solutionId],
    queryFn: async () => {
      if (!solutionId) return [];

      log('Buscando recursos da solução', { solutionId });

      try {
        const { data, error } = await supabase
          .from('solution_resources')
          .select('*')
          .eq('solution_id', solutionId as any)
          .order('order_index', { ascending: true });

        if (error) throw error;

        log('Recursos da solução carregados', { count: data?.length || 0 });
        return (data as any[]) || [];
      } catch (error) {
        logError('Erro ao buscar recursos da solução', error);
        throw error;
      }
    },
    enabled: !!solutionId
  });

  return { resources, loading, error };
};
