
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ForumPostWithMeta } from '@/lib/supabase/types/forum.types';

export const useForumPosts = (topicId?: string | null) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['forum', 'posts', topicId],
    queryFn: async (): Promise<ForumPostWithMeta[]> => {
      if (!topicId) return [];
      
      // Buscar todos os posts do tópico com informações do autor
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          ),
          forum_reactions (
            id,
            user_id,
            reaction_type
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar posts:', error);
        throw new Error('Falha ao carregar as respostas');
      }
      
      // Formatar os dados para corresponder ao tipo ForumPostWithMeta
      const formattedPosts: ForumPostWithMeta[] = data.map(post => {
        // Verificar se o usuário atual reagiu ao post
        const userReacted = profile?.id ? post.forum_reactions.some(
          reaction => reaction.user_id === profile.id
        ) : false;
        
        return {
          ...post,
          author: {
            id: post.profiles.id,
            name: post.profiles.name,
            avatar_url: post.profiles.avatar_url
          },
          reactions: {
            count: post.forum_reactions.length,
            user_reacted: userReacted
          },
          is_author: profile?.id === post.user_id
        };
      });
      
      return formattedPosts;
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 // 1 minuto
  });
};
