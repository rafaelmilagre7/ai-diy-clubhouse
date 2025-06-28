
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types/forumTypes';

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
            category:forum_categories!forum_topics_category_id_fkey(id, name, slug)
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

        console.log(`✅ ${data?.length || 0} tópicos carregados`);
        return data || [];

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
            category:forum_categories!forum_topics_category_id_fkey(id, name, slug)
          `)
          .eq('id', topicId)
          .single();

        if (error) {
          console.error('Erro ao buscar tópico:', error);
          throw error;
        }

        // Increment view count
        await supabase.rpc('increment_topic_views', { topic_id: topicId });

        console.log('✅ Tópico carregado com sucesso');
        return data;

      } catch (error) {
        console.error('Erro na consulta do tópico:', error);
        throw error;
      }
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000
  });
};
