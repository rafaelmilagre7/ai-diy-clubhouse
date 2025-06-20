
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Comment } from '@/types/commentTypes';

export const useDeleteComment = (solutionId: string, moduleId: string) => {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  const deleteComment = async (comment: Comment) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId || (comment.user_id !== userId && comment.profiles?.role !== 'admin')) {
      toast.error('Você só pode excluir seus próprios comentários');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('solution_comments')
        .delete()
        .eq('id', comment.id as any);
        
      if (error) throw error;
      
      toast.success('Comentário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
    } catch (error) {
      logError('Erro ao excluir comentário', error);
      toast.error('Erro ao excluir comentário. Tente novamente.');
    }
  };

  return { deleteComment };
};
