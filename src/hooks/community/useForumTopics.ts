
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types/forumTypes';

export type TopicFilterType = 'recentes' | 'populares' | 'sem-respostas' | 'resolvidos';

interface UseForumTopicsProps {
  categorySlug?: string;
  selectedFilter?: TopicFilterType;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

interface TopicsResponse {
  topics: Topic[];
  totalCount: number;
  hasMore: boolean;
}

export const useForumTopics = ({
  categorySlug,
  selectedFilter = 'recentes',
  searchQuery = '',
  page = 0,
  limit = 20
}: UseForumTopicsProps = {}) => {
  
  return useQuery({
    queryKey: ['forum-topics', categorySlug, selectedFilter, searchQuery, page],
    queryFn: async (): Promise<TopicsResponse> => {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            role
          ),
          category:forum_categories (
            id,
            name,
            slug,
            icon
          )
        `, { count: 'exact' });

      // Filtrar por categoria se especificado
      if (categorySlug) {
        const { data: category } = await supabase
          .from('forum_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // Aplicar filtros
      switch (selectedFilter) {
        case 'populares':
          query = query.order('view_count', { ascending: false });
          break;
        case 'sem-respostas':
          query = query.eq('reply_count', 0).order('created_at', { ascending: false });
          break;
        case 'resolvidos':
          query = query.eq('is_solved', true).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('last_activity_at', { ascending: false });
      }

      // Busca por texto
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Paginação
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) {
        console.error('Erro ao carregar tópicos:', error);
        throw error;
      }
      
      const totalCount = count || 0;
      const hasMore = (from + (data?.length || 0)) < totalCount;

      return {
        topics: data as Topic[] || [],
        totalCount,
        hasMore
      };
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  });
};
