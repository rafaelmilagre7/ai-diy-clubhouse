
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useDeleteModuleComment = (solutionId: string, moduleId: string) => {
  const { user } = useAuth();
  const { logError } = useLogging();
  const queryClient = useQueryClient();

  const deleteComment = async (commentObj: Comment) => {
    if (!user) return;
    
    try {
      // Verificar se o usuário é admin
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const isAdmin = userProfile?.role === 'admin';
      
      // Permitir exclusão apenas se for o autor ou admin
      if (commentObj.user_id !== user.id && !isAdmin) {
        toast.error('Você só pode excluir seus próprios comentários');
        return;
      }
      
      const { error } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', commentObj.id);
        
      if (error) throw error;
      
      toast.success('Comentário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
    } catch (error: any) {
      logError('Erro ao excluir comentário', error);
      toast.error(`Erro ao excluir comentário: ${error.message}`);
    }
  };

  return { deleteComment };
};
