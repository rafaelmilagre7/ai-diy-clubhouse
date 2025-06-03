
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useLogging } from '@/hooks/useLogging';

export const useToolsData = () => {
  const { log, logError } = useLogging();

  const query = useQuery<Tool[], Error>({
    queryKey: ['tools-data'],
    queryFn: async () => {
      log('Iniciando carregamento dos dados das ferramentas...');
      
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true)
          .order('name');

        if (error) {
          logError('Erro ao buscar dados das ferramentas:', error);
          throw error;
        }

        log('Dados das ferramentas carregados com sucesso', { 
          total: data?.length || 0 
        });

        return data || [];
      } catch (error) {
        logError('Erro inesperado ao carregar ferramentas:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
