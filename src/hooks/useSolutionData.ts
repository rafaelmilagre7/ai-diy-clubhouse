
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export const useSolutionData = (solutionId: string) => {
  const { log, logError } = useLogging('useSolutionData');

  const { 
    data: solution, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      try {
        log('Buscando solução', { id: solutionId });
        
        const { data, error } = await supabase
          .from('solutions')
          .select('*, modules(*)')
          .eq('id', solutionId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        log('Solução carregada com sucesso', { 
          id: data.id,
          title: data.title,
          modules: data.modules?.length || 0
        });
        
        return data as Solution;
      } catch (err) {
        logError('Erro ao buscar solução:', err);
        throw err;
      }
    },
    enabled: !!solutionId
  });

  return { 
    solution, 
    isLoading, 
    error,
    refetch
  };
};
