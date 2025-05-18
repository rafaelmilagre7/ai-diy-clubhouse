
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ForumTopicWithMeta } from '@/lib/supabase/types/forum.types';

export const useForumTopic = (topicId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['forum', 'topic', topicId],
    queryFn: async (): Promise<ForumTopicWithMeta | null> => {
      if (!topicId) return null;

      // Buscar o tópico com informações do autor e categoria
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq('id', topicId)
        .single();

      if (error) {
        console.error('Erro ao buscar tópico:', error);
        throw new Error('Falha ao carregar o tópico');
      }

      if (!data) return null;

      // Incrementar contador de visualizações
      try {
        await supabase.rpc('increment_topic_view_count', {
          topic_id: topicId
        });
      } catch (err) {
        console.error('Erro ao incrementar visualizações:', err);
      }

      // Formatar dados para corresponder ao tipo ForumTopicWithMeta
      const formattedTopic: ForumTopicWithMeta = {
        ...data,
        author: data.profiles ? {
          id: data.profiles.id,
          name: data.profiles.name,
          avatar_url: data.profiles.avatar_url
        } : undefined,
        category: data.categories ? {
          name: data.categories.name,
          slug: data.categories.slug
        } : undefined,
        is_author: profile?.id === data.user_id
      };

      return formattedTopic;
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};
