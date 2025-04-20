
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
        
        // Buscar comentários principais (usando sintaxe correta para join)
        const { data: parentComments, error: parentError } = await supabase
          .from('tool_comments')
          .select(`
            *,
            profiles(name, avatar_url, role)
          `)
          .eq('tool_id', solutionId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) {
          logError('Erro ao buscar comentários principais', parentError);
          throw parentError;
        }

        // Buscar respostas (usando sintaxe correta para join)
        const { data: replies, error: repliesError } = await supabase
          .from('tool_comments')
          .select(`
            *,
            profiles(name, avatar_url, role)
          `)
          .eq('tool_id', solutionId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) {
          logError('Erro ao buscar respostas', repliesError);
          throw repliesError;
        }
        
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
        
        // Organizar comentários em estrutura hierárquica
        const organizedComments = (parentComments || []).map((comment: any) => ({
          ...comment,
          user_has_liked: !!userLikes[comment.id],
          replies: (replies || [])
            .filter((reply: any) => reply.parent_id === comment.id)
            .map((reply: any) => ({
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
        // Retornar array vazio em caso de erro para não quebrar a interface
        return [];
      }
    },
    staleTime: 30000,
    enabled: !!solutionId && !!moduleId
  });
};
