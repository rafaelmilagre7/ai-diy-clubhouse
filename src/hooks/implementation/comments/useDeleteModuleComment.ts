
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Comment } from '@/types/commentTypes';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useDeleteModuleComment = (solutionId: string, moduleId: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { logError, log } = useLogging();

  const deleteComment = async (comment: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para excluir comentários');
      return;
    }

    const isAuthor = user.id === comment.user_id;
    const isAdmin = profile?.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      toast.error('Você só pode excluir seus próprios comentários');
      return;
    }

    if (isDeleting) return;

    try {
      setIsDeleting(true);
      log('Excluindo comentário', { commentId: comment.id });
      
      const { error } = await supabase
        .from('solution_comments')
        .delete()
        .eq('id', comment.id);
        
      if (error) throw error;
      
      toast.success('Comentário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      
    } catch (error) {
      logError('Erro ao excluir comentário', error);
      toast.error('Erro ao excluir comentário. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteComment, isDeleting };
};
