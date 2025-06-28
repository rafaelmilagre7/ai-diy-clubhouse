
import { useState } from 'react';
import { toast } from 'sonner';
import { Comment } from '@/types/commentTypes';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useQueryClient } from '@tanstack/react-query';

export const useDeleteComment = (solutionId: string, moduleId: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isAdmin } = useSimpleAuth();
  const queryClient = useQueryClient();

  const deleteComment = async (comment: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para excluir comentários');
      return;
    }

    const isAuthor = user.id === comment.user_id;
    
    if (!isAuthor && !isAdmin) {
      toast.error('Você só pode excluir seus próprios comentários');
      return;
    }

    if (isDeleting) return;

    try {
      setIsDeleting(true);
      console.log('Simulando exclusão de comentário:', comment.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Comentário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteComment, isDeleting };
};
