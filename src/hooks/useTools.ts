
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';

export const useTools = () => {
  return useQuery<Tool[], Error>({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data as Tool[];
    }
  });
};
