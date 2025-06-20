
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Comment } from '@/types/commentTypes';

export const useLikeComment = (solutionId: string, moduleId: string) => {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  const likeComment = async (comment: Comment) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    try {
      if (comment.user_has_liked) {
        // Remover curtida
        const { error } = await supabase
          .from('solution_comment_likes')
          .delete()
          .eq('comment_id', comment.id as any)
          .eq('user_id', userId as any);
          
        if (error) throw error;
        
        await supabase
          .from('solution_comments')
          .update({ likes_count: comment.likes_count - 1 } as any)
          .eq('id', comment.id as any);
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from('solution_comment_likes')
          .insert({
            comment_id: comment.id,
            user_id: userId
          } as any);
          
        if (error) throw error;
        
        await supabase
          .from('solution_comments')
          .update({ likes_count: comment.likes_count + 1 } as any)
          .eq('id', comment.id as any);
      }
      
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
    } catch (error) {
      logError('Erro ao curtir comentário', error);
      toast.error('Erro ao curtir comentário. Tente novamente.');
    }
  };

  return { likeComment };
};
