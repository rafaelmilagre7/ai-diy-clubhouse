
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';
import { useAuth } from '@/contexts/auth';

export const useFetchComments = (solutionId: string, moduleId: string) => {
  const { log, logError } = useLogging();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      try {
        log('Buscando comentários da solução', { solutionId, moduleId });
        
        // Verificamos se a tabela solution_comments existe, se não, usamos tool_comments
        const { data: checkTable } = await supabase
          .from('tool_comments')
          .select('id')
          .limit(1);
        
        const tableName = checkTable !== null ? 'tool_comments' : 'solution_comments';
        log(`Usando tabela ${tableName} para comentários`, { solutionId, moduleId });
        
        // Buscar comentários principais
        const { data: parentComments, error: parentError } = await supabase
          .from(tableName)
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('tool_id', solutionId as any)
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
          .eq('tool_id', solutionId as any)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;

        // Verificar curtidas do usuário atual
        let likesMap: Record<string, boolean> = {};
        
        if (user) {
          const { data: userLikes } = await supabase
            .from(`${tableName.replace('comments', 'comment')}_likes`)
            .select('comment_id')
            .eq('user_id', user.id as any);

          likesMap = (userLikes || []).reduce((acc: Record<string, boolean>, like: any) => {
            acc[(like as any).comment_id] = true;
            return acc;
          }, {});
        }

        // Organizar comentários com respostas
        const organizedComments = (parentComments as any).map((comment: any) => ({
          ...comment,
          user_has_liked: !!likesMap[comment.id],
          replies: (replies as any)
            .filter((reply: any) => (reply as any).parent_id === comment.id)
            .map((reply: any) => ({
              ...reply,
              user_has_liked: !!likesMap[reply.id]
            }))
        }));

        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        return [];
      }
    }
  });
};
