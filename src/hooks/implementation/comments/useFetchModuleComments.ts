
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

export const useFetchModuleComments = (solutionId: string, moduleId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();

  return useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      try {
        log('Buscando comentários da solução', { solutionId, moduleId });
        
        const tableName = 'tool_comments';
        const idField = 'tool_id';
        
        // Buscar comentários principais
        const { data: parentComments, error: parentError } = await supabase
          .from(tableName)
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq(idField, solutionId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) throw parentError;

        // Buscar respostas
        const { data: replies, error: repliesError } = await supabase
          .from(tableName)
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq(idField, solutionId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        
        // Verificar curtidas do usuário
        let userLikes: Record<string, boolean> = {};
        if (user) {
          const { data: likes } = await supabase
            .from('tool_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);
            
          userLikes = (likes || []).reduce((acc: Record<string, boolean>, like) => {
            acc[like.comment_id] = true;
            return acc;
          }, {});
        }
        
        // Organizar comentários
        const organizedComments = (parentComments || []).map((comment: Comment) => ({
          ...comment,
          user_has_liked: !!userLikes[comment.id],
          replies: (replies || [])
            .filter((reply: Comment) => reply.parent_id === comment.id)
            .map((reply: Comment) => ({
              ...reply,
              user_has_liked: !!userLikes[reply.id]
            }))
        }));

        log('Comentários carregados com sucesso', { 
          total: organizedComments.length
        });
        
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        return [];
      }
    },
    staleTime: 30000,
    enabled: !!solutionId && !!moduleId
  });
};
