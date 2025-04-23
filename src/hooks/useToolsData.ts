
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useLogging } from '@/hooks/useLogging';

/**
 * Hook para carregar dados de todas as ferramentas disponíveis
 * Usado para garantir que os dados das ferramentas estejam disponíveis antes de mostrar ferramentas específicas
 */
export const useToolsData = () => {
  const { log, logError } = useLogging("useToolsData");

  const query = useQuery({
    queryKey: ['tools-data'],
    queryFn: async () => {
      try {
        log("Carregando dados de ferramentas");
        
        // Buscar todas as ferramentas ativas
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true);
          
        if (error) {
          throw error;
        }
        
        log("Ferramentas carregadas", { count: data?.length || 0 });
        return data as Tool[];
      } catch (error) {
        logError("Erro ao carregar ferramentas", { error });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
