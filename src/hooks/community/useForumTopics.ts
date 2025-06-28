
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumTopic } from '@/types/forumTypes';

export type TopicFilterType = 'all' | 'recent' | 'popular' | 'unanswered' | 'solved';

export const useForumTopics = (categoryId?: string | null, filter: TopicFilterType = 'all') => {
  return useQuery({
    queryKey: ['forum-topics', categoryId, filter],
    queryFn: async (): Promise<{ topics: ForumTopic[], categories: any[] }> => {
      console.log('Simulando busca de tópicos do fórum', { categoryId, filter });

      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            email
          ),
          forum_categories:category_id (
            id,
            name
          )
        `)
        .eq('is_deleted', false);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Apply filter
      switch (filter) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('views_count', { ascending: false });
          break;
        case 'unanswered':
          query = query.eq('replies_count', 0);
          break;
        case 'solved':
          // Since is_solved doesn't exist, simulate with replies > 0
          query = query.gt('replies_count', 0);
          break;
        default:
          query = query.order('last_activity_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar tópicos:', error);
        throw error;
      }

      // Transform data to match ForumTopic interface
      const topics: ForumTopic[] = data?.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        content: topic.content,
        user_id: topic.user_id,
        category_id: topic.category_id,
        views_count: topic.views_count,
        replies_count: topic.replies_count,
        is_pinned: topic.is_pinned,
        is_locked: topic.is_locked,
        is_solved: false, // Default since column doesn't exist
        created_at: topic.created_at,
        updated_at: topic.updated_at,
        last_activity_at: topic.last_activity_at,
        author: topic.profiles ? {
          id: topic.profiles.id,
          name: topic.profiles.name || topic.profiles.email,
          email: topic.profiles.email
        } : { id: '', name: 'Usuário', email: '' },
        category: topic.forum_categories ? {
          id: topic.forum_categories.id,
          name: topic.forum_categories.name,
          slug: topic.forum_categories.name?.toLowerCase().replace(/\s+/g, '-') || 'categoria'
        } : { id: '', name: 'Categoria', slug: 'categoria' }
      })) || [];

      // Get categories for filter
      const { data: categoriesData } = await supabase
        .from('forum_categories')
        .select('id, name')
        .order('name');

      const categories = categoriesData?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-')
      })) || [];

      return { topics, categories };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};
