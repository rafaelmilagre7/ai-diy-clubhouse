
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Comment } from '@/types/commentTypes';
import { toast } from 'sonner';

export const useCommentActions = (onSuccess: () => void) => {
  const { user } = useAuth();

  const likeComment = async (comment: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    try {
      const alreadyLiked = comment.user_has_liked;
      
      if (alreadyLiked) {
        // Remover curtida - o trigger automaticamente atualizará o contador
        const { error } = await supabase
          .from('tool_comment_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Adicionar curtida - o trigger automaticamente atualizará o contador
        const { error } = await supabase
          .from('tool_comment_likes')
          .insert({
            comment_id: comment.id,
            user_id: user.id
          });
          
        if (error) throw error;
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao curtir comentário:', error);
      toast.error(`Erro ao curtir comentário: ${error.message}`);
    }
  };
  
  const deleteComment = async (comment: Comment) => {
    if (!user) return;
    
    // Verificar se o usuário é o autor do comentário
    if (comment.user_id !== user.id) {
      toast.error('Você só pode excluir seus próprios comentários');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', comment.id);
        
      if (error) throw error;
      
      toast.success('Comentário excluído com sucesso');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao excluir comentário:', error);
      toast.error(`Erro ao excluir comentário: ${error.message}`);
    }
  };

  return {
    likeComment,
    deleteComment
  };
};
