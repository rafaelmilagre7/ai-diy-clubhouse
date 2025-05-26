
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface UsePostInteractionsProps {
  postId: string;
  topicId: string;
  authorId: string;
  onPostDeleted?: () => void;
}

export const usePostInteractions = ({
  postId,
  topicId,
  authorId,
  onPostDeleted
}: UsePostInteractionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingSolution, setIsMarkingSolution] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verificar permissões
  const canDelete = user && (user.id === authorId || user.role === 'admin');
  const canMarkAsSolution = (topicAuthorId: string) => {
    return user && (user.id === topicAuthorId || user.role === 'admin');
  };

  // Deletar post
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (!canDelete) {
        throw new Error('Sem permissão para deletar este post');
      }

      const { error } = await supabase.rpc('deleteforumpost', {
        post_id: postId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      onPostDeleted?.();
    },
    onError: (error: any) => {
      console.error('Erro ao deletar post:', error);
      toast.error('Erro ao excluir post: ' + error.message);
    }
  });

  // Marcar como solução
  const markSolutionMutation = useMutation({
    mutationFn: async (topicAuthorId: string) => {
      if (!canMarkAsSolution(topicAuthorId)) {
        throw new Error('Sem permissão para marcar como solução');
      }

      const { error } = await supabase.rpc('mark_topic_solved', {
        p_topic_id: topicId,
        p_post_id: postId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Resposta marcada como solução!');
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
    },
    onError: (error: any) => {
      console.error('Erro ao marcar como solução:', error);
      toast.error('Erro ao marcar como solução: ' + error.message);
    }
  });

  // Curtir post (nova funcionalidade)
  const likePostMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('forum_reactions')
        .upsert({
          post_id: postId,
          user_id: user?.id,
          reaction_type: 'like'
        }, { onConflict: 'post_id,user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post curtido!');
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
    },
    onError: (error: any) => {
      console.error('Erro ao curtir post:', error);
      toast.error('Erro ao curtir post');
    }
  });

  return {
    // Permissões
    canDelete,
    canMarkAsSolution,
    
    // Estados
    isDeleting: deletePostMutation.isPending,
    isMarkingSolution: markSolutionMutation.isPending,
    isLiking: likePostMutation.isPending,
    
    // Ações
    handleDeletePost: deletePostMutation.mutate,
    handleMarkAsSolution: markSolutionMutation.mutate,
    handleLikePost: likePostMutation.mutate
  };
};
