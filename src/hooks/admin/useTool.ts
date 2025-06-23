
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';

export const useTool = (toolId: string | null) => {
  return useQuery<Tool | null, Error>({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      if (!toolId || toolId === 'new') {
        return null;
      }

      console.log('Buscando ferramenta:', toolId);
      
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) {
        console.error('Erro ao buscar ferramenta:', error);
        throw error;
      }

      return data as Tool;
    },
    enabled: !!toolId && toolId !== 'new',
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};
