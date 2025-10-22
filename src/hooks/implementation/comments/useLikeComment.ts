
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
          .eq('comment_id', comment.id)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        await supabase
          .from('solution_comments')
          .update({ likes_count: comment.likes_count - 1 })
          .eq('id', comment.id);
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from('solution_comment_likes')
          .insert({
            comment_id: comment.id,
            user_id: userId
          });
          
        if (error) throw error;
        
        await supabase
          .from('solution_comments')
          .update({ likes_count: comment.likes_count + 1 })
          .eq('id', comment.id);

        // 📢 Criar notificação para o autor do comentário (se não for o próprio usuário)
        if (comment.user_id !== userId) {
          // Buscar informações do usuário que curtiu
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', userId)
            .single();

          const contentPreview = comment.content.substring(0, 100);
          
          await supabase
            .from('notifications')
            .insert({
              user_id: comment.user_id,
              actor_id: userId,
              type: 'comment_liked',
              title: `${profile?.name || 'Alguém'} curtiu seu comentário`,
              message: `"${contentPreview}${comment.content.length > 100 ? '...' : ''}"`,
              action_url: `/solucoes/${solutionId}/modulos/${moduleId}#comment-${comment.id}`,
              category: 'engagement',
              priority: 1
            });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
    } catch (error) {
      logError('Erro ao curtir comentário', error);
      toast.error('Erro ao curtir comentário. Tente novamente.');
    }
  };

  return { likeComment };
};
