
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumCategory } from '@/types/forumTypes';

export const useForumCategories = () => {
  return useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as ForumCategory[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
