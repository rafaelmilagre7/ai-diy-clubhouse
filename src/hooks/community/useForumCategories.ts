
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumCategory } from '@/types/forumTypes';

export const useForumCategories = () => {
  const query = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async (): Promise<ForumCategory[]> => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('Erro ao carregar categorias:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    categories: query.data || [],
    data: query.data || [], // Mantém compatibilidade
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
