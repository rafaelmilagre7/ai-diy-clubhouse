
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useLogging } from '@/hooks/useLogging';

export const useTools = () => {
  const { log, logError } = useLogging();

  const query = useQuery<Tool[], Error>({
    queryKey: ['tools'],
    queryFn: async () => {
      log('Buscando ferramentas...');
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', true)
        .order('name');

      if (error) {
        logError('Erro ao buscar ferramentas:', error);
        throw error;
      }

      // Verificar quais ferramentas possuem logos válidas
      const toolsWithLogosInfo = data.map(tool => ({
        ...tool,
        has_valid_logo: !!tool.logo_url
      }));

      log('Ferramentas encontradas:', { 
        total: data.length,
        comLogo: toolsWithLogosInfo.filter(t => t.has_valid_logo).length,
        semLogo: toolsWithLogosInfo.filter(t => !t.has_valid_logo).length
      });

      return data as Tool[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
