
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types/forumTypes';

export type TopicFilterType = 'recentes' | 'populares' | 'sem-respostas' | 'resolvidos';

interface UseForumTopicsProps {
  activeTab: string;
  selectedFilter: TopicFilterType;
  searchQuery: string;
  categories: any[];
  categorySlug?: string;
}

export const useForumTopics = ({
  activeTab,
  selectedFilter,
  searchQuery,
  categories,
  categorySlug
}: UseForumTopicsProps) => {
  return useQuery({
    queryKey: ['forum-topics', activeTab, selectedFilter, searchQuery, categorySlug],
    queryFn: async () => {
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
            slug
          )
        `);

      // Filtrar por categoria se especificado
      if (categorySlug) {
        const category = categories.find(cat => cat.slug === categorySlug);
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
          query = query.eq('reply_count', 0);
          break;
        case 'resolvidos':
          query = query.eq('is_solved', true);
          break;
        default:
          query = query.order('last_activity_at', { ascending: false });
      }

      // Busca por texto
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data as Topic[];
    },
    enabled: categories && categories.length > 0,
    staleTime: 30 * 1000, // 30 segundos
  });
};
