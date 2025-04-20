
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';

export const useFetchComments = (solutionId: string, moduleId: string) => {
  const { log, logError } = useLogging();

  return useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      try {
        log('Buscando comentários da solução', { solutionId, moduleId });
        
        // Buscar comentários principais
        const { data: parentComments, error: parentError } = await supabase
          .from('solution_comments')
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('solution_id', solutionId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) throw parentError;

        // Buscar respostas
        const { data: replies, error: repliesError } = await supabase
          .from('solution_comments')
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('solution_id', solutionId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;

        // Verificar curtidas do usuário atual
        const { data: userLikes } = await supabase
          .from('solution_comment_likes')
          .select('comment_id')
          .eq('user_id', supabase.auth.getUser());

        const likesMap = userLikes?.reduce((acc: Record<string, boolean>, like) => {
          acc[like.comment_id] = true;
          return acc;
        }, {});

        // Organizar comentários com respostas
        const organizedComments = parentComments.map((comment: Comment) => ({
          ...comment,
          user_has_liked: !!likesMap?.[comment.id],
          replies: replies
            .filter((reply: Comment) => reply.parent_id === comment.id)
            .map((reply: Comment) => ({
              ...reply,
              user_has_liked: !!likesMap?.[reply.id]
            }))
        }));

        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        throw error;
      }
    }
  });
};
