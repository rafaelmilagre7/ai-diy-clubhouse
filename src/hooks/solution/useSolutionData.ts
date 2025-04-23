
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/types/supabaseTypes';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useSolutionData = (solutionId: string) => {
  const { log, logError } = useLogging('useSolutionData');
  const [solution, setSolution] = useState<Solution | null>(null);
  
  const { 
    data, 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      try {
        // Se não há ID, não buscar dados
        if (!solutionId) {
          return null;
        }

        console.log('Buscando solução com ID:', solutionId);
        
        // Buscar do servidor
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        console.log('Solução encontrada:', data);
        return data as Solution;
      } catch (err) {
        logError('Erro ao buscar solução:', err);
        
        // Notificar o usuário sobre erros de conexão
        if (navigator.onLine === false) {
          toast.error("Erro de conexão", {
            description: "Verifique sua conexão com a internet e tente novamente."
          });
        }
        
        throw err;
      }
    },
    enabled: !!solutionId,
    staleTime: 1 * 60 * 1000, // 1 minuto de cache
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Atualizar o estado quando os dados mudam
  useEffect(() => {
    if (data) {
      setSolution(data);
    }
  }, [data]);

  return { 
    solution: solution || data, 
    loading: isLoading,
    isLoading,
    isFetching,
    error,
    refetch,
    setSolution
  };
};
