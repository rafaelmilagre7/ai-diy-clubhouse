
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumCategory } from '@/lib/supabase/types/forum.types';

export function useForumCategories() {
  return useQuery({
    queryKey: ['forum', 'categories'],
    queryFn: async (): Promise<ForumCategory[]> => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data || [];
    }
  });
}
