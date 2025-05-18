
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumTopicWithMeta } from '@/lib/supabase/types/forum.types';
import { useAuth } from '@/contexts/auth';

export function useForumTopics(categoryId?: string | null) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['forum', 'topics', categoryId],
    queryFn: async (): Promise<ForumTopicWithMeta[]> => {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url),
          forum_categories!inner (name, slug)
        `);

      // Filtrar por categoria se especificado
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tópicos:', error);
        throw error;
      }

      // Transformar e mapear os dados
      return (data || []).map(item => {
        const topic = {
          ...item,
          author: item.profiles ? {
            id: item.profiles.id,
            name: item.profiles.name,
            avatar_url: item.profiles.avatar_url
          } : undefined,
          category: item.forum_categories ? {
            name: item.forum_categories.name,
            slug: item.forum_categories.slug
          } : undefined,
          is_author: profile?.id === item.user_id
        };
        
        // Remover campos aninhados para evitar confusão
        delete topic.profiles;
        delete topic.forum_categories;
        
        return topic as ForumTopicWithMeta;
      });
    },
    enabled: !!categoryId || categoryId === null // Habilita a query se categoryId for fornecido ou explicitamente nulo
  });
}
