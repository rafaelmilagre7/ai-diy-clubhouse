
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { queryClient } from '@/lib/react-query';

export const useInitialFetch = (solutionId: string | undefined) => {
  const { log, logError } = useLogging('useInitialFetch');
  const [solutionState, setSolution] = useState<Solution | null>(null);

  const { 
    data, 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      if (!solutionId) {
        log('ID da solução não fornecido');
        return null;
      }

      try {
        log('Buscando solução', { id: solutionId });
        
        // Verificar se já temos os dados em cache
        const cachedData = queryClient.getQueryData<Solution>(['solution', solutionId]);
        if (cachedData) {
          log('Solução encontrada em cache', { 
            id: cachedData.id,
            title: cachedData.title
          });
          setSolution(cachedData);
          return cachedData;
        }
        
        // Caso não tenha em cache, buscar do servidor
        const { data, error } = await supabase
          .from('solutions')
          .select(`
            *,
            modules (*)
          `)
          .eq('id', solutionId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        log('Solução encontrada com sucesso', { 
          id: data.id,
          title: data.title,
          modules: data.modules?.length || 0
        });
        
        setSolution(data as Solution);
        return data as Solution;
      } catch (err) {
        logError('Erro ao buscar solução:', err);
        throw err;
      }
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    retry: 1,
    refetchOnWindowFocus: false
  });

  return { 
    solution: solutionState || data,
    loading: isLoading, 
    isLoading,
    isFetching,
    error, 
    refetch,
    setSolution
  };
};
