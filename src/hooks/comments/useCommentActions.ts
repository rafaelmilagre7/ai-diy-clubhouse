
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Comment } from '@/types/commentTypes';

export const useCommentActions = (onSuccess: () => void) => {
  const { user } = useAuth();

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir comentários.");
      return;
    }
    
    try {
      const { data: existingLike, error: checkError } = await supabase
        .from('tool_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingLike) {
        const { error: removeError } = await supabase
          .from('tool_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (removeError) throw removeError;
        
        await supabase.rpc('decrement', { 
          row_id: commentId, 
          table: 'tool_comments', 
          column: 'likes_count' 
        });
        
        toast.success("Curtida removida");
      } else {
        const { error: addError } = await supabase
          .from('tool_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
          
        if (addError) throw addError;
        
        await supabase.rpc('increment', { 
          row_id: commentId, 
          table: 'tool_comments', 
          column: 'likes_count' 
        });
        
        toast.success("Comentário curtido");
      }
      
      onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao curtir comentário:', error);
      toast.error(`Erro ao processar curtida: ${error.message}`);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { data: comment, error: fetchError } = await supabase
        .from('tool_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const isAuthor = comment.user_id === user.id;
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const isAdmin = userProfile.role === 'admin';
      
      if (!isAuthor && !isAdmin) {
        toast.error("Você não tem permissão para excluir este comentário.");
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', commentId);
        
      if (deleteError) throw deleteError;
      
      toast.success("Comentário excluído com sucesso!");
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
