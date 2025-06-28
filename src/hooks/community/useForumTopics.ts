
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Topic {
  id: string;
  title: string;
  content: string;
  category_id: string;
  user_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved?: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export type TopicFilterType = 'all' | 'popular' | 'recent' | 'solved' | 'unsolved';

export const useForumTopics = (categoryId?: string, limit = 20) => {
  return useQuery({
    queryKey: ['forum-topics', categoryId, limit],
    queryFn: async (): Promise<Topic[]> => {
      console.log('🗨️ Buscando tópicos do fórum...');
      
      try {
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            profiles!forum_topics_user_id_fkey(id, name, avatar_url),
            forum_categories!forum_topics_category_id_fkey(id, name, slug)
          `)
          .order('is_pinned', { ascending: false })
          .order('last_activity_at', { ascending: false })
          .limit(limit);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar tópicos:', error);
          throw error;
        }

        // Map the data to match our Topic interface
        const topics: Topic[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category_id: item.category_id,
          user_id: item.user_id,
          view_count: item.views_count || 0,
          reply_count: item.replies_count || 0,
          is_pinned: item.is_pinned || false,
          is_locked: item.is_locked || false,
          is_solved: false, // Default value since property doesn't exist
          created_at: item.created_at,
          updated_at: item.updated_at,
          last_activity_at: item.last_activity_at,
          profiles: item.profiles,
          category: item.forum_categories?.error ? 
            { id: '', name: 'Categoria não encontrada', slug: '' } : 
            item.forum_categories
        }));

        console.log(`✅ ${topics.length} tópicos carregados`);
        return topics;

      } catch (error) {
        console.error('Erro na consulta de tópicos:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useForumTopic = (topicId: string) => {
  return useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;

      console.log('🗨️ Buscando tópico específico:', topicId);

      try {
        const { data, error } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles!forum_topics_user_id_fkey(id, name, avatar_url),
            forum_categories!forum_topics_category_id_fkey(id, name, slug)
          `)
          .eq('id', topicId)
          .single();

        if (error) {
          console.error('Erro ao buscar tópico:', error);
          throw error;
        }

        // Map the data to match our Topic interface
        const topic: Topic = {
          id: data.id,
          title: data.title,
          content: data.content,
          category_id: data.category_id,
          user_id: data.user_id,
          view_count: data.views_count || 0,
          reply_count: data.replies_count || 0,
          is_pinned: data.is_pinned || false,
          is_locked: data.is_locked || false,
          is_solved: false, // Default value
          created_at: data.created_at,
          updated_at: data.updated_at,
          last_activity_at: data.last_activity_at,
          profiles: data.profiles,
          category: data.forum_categories?.error ? 
            { id: '', name: 'Categoria não encontrada', slug: '' } : 
            data.forum_categories
        };

        // Increment view count
        await supabase.rpc('increment_topic_views', { topic_id: topicId });

        console.log('✅ Tópico carregado com sucesso');
        return topic;

      } catch (error) {
        console.error('Erro na consulta do tópico:', error);
        throw error;
      }
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000
  });
};
