
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Post } from '@/types/forumTypes';

interface UsePostItemProps {
  post: Post;
  topicId?: string;
  onSuccess?: () => void;
}

export const usePostItem = ({ post, topicId, onSuccess }: UsePostItemProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isOwner = post.user_id === user?.id;
  const isSolutionPost = post.is_accepted_solution || post.is_solution;

  const handleMarkAsSolution = async () => {
    if (!user?.id || !topicId) return;
    
    try {
      setIsSubmitting(true);
      
      // Remover solução anterior se existir
      await supabase
        .from('forum_posts')
        .update({ is_accepted_solution: false })
        .eq('topic_id', topicId)
        .eq('is_accepted_solution', true);
      
      // Marcar novo post como solução
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_accepted_solution: true })
        .eq('id', post.id);
      
      if (error) throw error;
      
      // Marcar tópico como resolvido
      await supabase
        .from('forum_topics')
        .update({ is_solved: true })
        .eq('id', topicId);
      
      toast.success('Post marcado como solução!');
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao marcar como solução:', error);
      toast.error('Erro ao marcar como solução');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnmarkAsSolution = async () => {
    if (!user?.id || !topicId) return;
    
    try {
      setIsSubmitting(true);
      
      // Remover como solução
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_accepted_solution: false })
        .eq('id', post.id);
      
      if (error) throw error;
      
      // Desmarcar tópico como resolvido
      await supabase
        .from('forum_topics')
        .update({ is_solved: false })
        .eq('id', topicId);
      
      toast.success('Solução removida!');
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao remover solução:', error);
      toast.error('Erro ao remover solução');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user?.id) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      
      toast.success('Post excluído com sucesso!');
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOwner,
    isSolutionPost,
    isSubmitting,
    handleMarkAsSolution,
    handleUnmarkAsSolution,
    handleDeletePost
  };
};
