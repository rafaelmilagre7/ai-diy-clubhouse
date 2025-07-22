
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Comment } from '@/types/commentTypes';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useLikeModuleComment = (solutionId: string, moduleId: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logError, log } = useLogging();

  const likeComment = async (comment: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      log('Processando curtida', { commentId: comment.id });
      
      if (comment.user_has_liked) {
        // Remover curtida
        const { error: deleteError } = await supabase
          .from('solution_comment_likes')
          .delete()
          .match({ 
            user_id: user.id,
            comment_id: comment.id
          });
          
        if (deleteError) throw deleteError;
        
        // Decrementar contador
        const { error: decrementError } = await supabase
          .from('solution_comments')
          .update({ likes_count: Math.max(0, (comment.likes_count || 1) - 1) })
          .eq('id', comment.id);
        
        if (decrementError) throw decrementError;
        
      } else {
        // Adicionar curtida
        const { error: insertError } = await supabase
          .from('solution_comment_likes')
          .insert({
            user_id: user.id,
            comment_id: comment.id
          });
          
        if (insertError) throw insertError;
        
        // Incrementar contador
        const { error: incrementError } = await supabase
          .from('solution_comments')
          .update({ likes_count: (comment.likes_count || 0) + 1 })
          .eq('id', comment.id);
        
        if (incrementError) throw incrementError;
      }
      
      // Atualizar a query
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      
    } catch (error) {
      logError('Erro ao processar curtida', error);
      toast.error('Não foi possível processar sua curtida. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return { likeComment, isProcessing };
};
