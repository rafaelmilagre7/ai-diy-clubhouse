
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useLikeModuleComment = (solutionId: string, moduleId: string) => {
  const { user } = useAuth();
  const { logError } = useLogging();
  const queryClient = useQueryClient();

  const likeComment = async (commentObj: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    try {
      const tableName = 'tool_comment_likes';
      const alreadyLiked = commentObj.user_has_liked;
      
      if (alreadyLiked) {
        // Remover curtida
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('comment_id', commentObj.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Decrementar contador
        await supabase
          .rpc('decrement', { 
            row_id: commentObj.id, 
            table_name: 'tool_comments', 
            column_name: 'likes_count'
          });
          
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from(tableName)
          .insert({
            comment_id: commentObj.id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        // Incrementar contador
        await supabase
          .rpc('increment', { 
            row_id: commentObj.id, 
            table_name: 'tool_comments', 
            column_name: 'likes_count'
          });
      }
      
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
    } catch (error: any) {
      logError('Erro ao curtir comentário', error);
      toast.error(`Erro ao curtir comentário: ${error.message}`);
    }
  };

  return { likeComment };
};
