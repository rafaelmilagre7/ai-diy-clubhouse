
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumPostWithMeta } from '@/lib/supabase/types/forum.types';
import { useAuth } from '@/contexts/auth';

export function useForumPosts(topicId: string | undefined) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['forum', 'posts', topicId],
    queryFn: async (): Promise<ForumPostWithMeta[]> => {
      if (!topicId) throw new Error('ID do tópico não fornecido');

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url),
          reactions:forum_reactions (id, user_id, reaction_type)
        `)
        .eq('topic_id', topicId)
        .is('parent_id', null) // Apenas posts raiz (não respostas)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
      }

      // Buscar respostas para cada post
      const postsWithReplies = await Promise.all((data || []).map(async (post) => {
        // Buscar respostas para este post
        const { data: replies, error: repliesError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profiles:user_id (id, name, avatar_url),
            reactions:forum_reactions (id, user_id, reaction_type)
          `)
          .eq('parent_id', post.id)
          .order('created_at', { ascending: true });

        if (repliesError) {
          console.error('Erro ao buscar respostas:', repliesError);
        }

        // Converter e mapear respostas
        const processedReplies = (replies || []).map(reply => {
          const replyWithMeta = {
            ...reply,
            author: reply.profiles ? {
              id: reply.profiles.id,
              name: reply.profiles.name,
              avatar_url: reply.profiles.avatar_url
            } : undefined,
            reactions: {
              count: (reply.reactions || []).length,
              user_reacted: (reply.reactions || []).some(r => r.user_id === profile?.id)
            },
            is_author: profile?.id === reply.user_id
          };
          
          // Remover campos aninhados para evitar confusão
          delete replyWithMeta.profiles;
          delete replyWithMeta.reactions;
          
          return replyWithMeta as ForumPostWithMeta;
        });

        // Construir post com suas respostas
        const postWithMeta = {
          ...post,
          author: post.profiles ? {
            id: post.profiles.id,
            name: post.profiles.name,
            avatar_url: post.profiles.avatar_url
          } : undefined,
          reactions: {
            count: (post.reactions || []).length,
            user_reacted: (post.reactions || []).some(r => r.user_id === profile?.id)
          },
          replies: processedReplies,
          is_author: profile?.id === post.user_id
        };
        
        // Remover campos aninhados para evitar confusão
        delete postWithMeta.profiles;
        delete postWithMeta.reactions;
        
        return postWithMeta as ForumPostWithMeta;
      }));

      return postsWithReplies;
    },
    enabled: !!topicId
  });
}
