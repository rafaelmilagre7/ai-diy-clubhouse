
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumTopicWithMeta } from '@/lib/supabase/types/forum.types';
import { useAuth } from '@/contexts/auth';

export function useForumTopic(topicId: string | undefined) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['forum', 'topic', topicId],
    queryFn: async (): Promise<ForumTopicWithMeta | null> => {
      if (!topicId) return null;

      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url),
          forum_categories!inner (id, name, slug)
        `)
        .eq('id', topicId)
        .single();

      if (error) {
        console.error('Erro ao buscar tópico:', error);
        throw error;
      }

      // Incrementar contador de visualizações
      await supabase
        .from('forum_topics')
        .update({ view_count: data.view_count + 1 })
        .eq('id', topicId);

      // Transformar dados
      const topic = {
        ...data,
        author: data.profiles ? {
          id: data.profiles.id,
          name: data.profiles.name,
          avatar_url: data.profiles.avatar_url
        } : undefined,
        category: data.forum_categories ? {
          name: data.forum_categories.name,
          slug: data.forum_categories.slug
        } : undefined,
        is_author: profile?.id === data.user_id
      };
      
      // Remover campos aninhados para evitar confusão
      delete topic.profiles;
      delete topic.forum_categories;
      
      return topic as ForumTopicWithMeta;
    },
    enabled: !!topicId
  });
}
