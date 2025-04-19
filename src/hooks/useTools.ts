
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';

export const useTools = () => {
  const query = useQuery<Tool[], Error>({
    queryKey: ['tools'],
    queryFn: async () => {
      console.log('Buscando ferramentas...');
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }

      console.log('Ferramentas encontradas:', data);
      return data as Tool[];
    }
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
