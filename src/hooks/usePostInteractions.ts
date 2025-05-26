
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verificar se pode deletar (autor ou admin)
  const canDelete = user && (user.id === authorId || user.role === 'admin');
  
  // Verificar se pode marcar como solução (autor do tópico ou admin)
  const canMarkAsSolution = (topicAuthorId: string) => {
    return user && (user.id === topicAuthorId || user.role === 'admin');
  };

  const handleDeletePost = async () => {
    if (!user) return;

    // Verificar se é o autor ou admin
    const isAuthor = user.id === authorId;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para excluir este post.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      
      onPostDeleted?.();
      
    } catch (error: any) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: "Erro ao excluir post",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsSolution = async (topicAuthorId: string) => {
    if (!canMarkAsSolution(topicAuthorId)) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para marcar esta resposta como solução.",
        variant: "destructive",
      });
      return;
    }
    
    setIsMarkingSolution(true);
    
    try {
      // Usar a função RPC do Supabase para marcar como solução
      const { data, error } = await supabase.rpc('mark_topic_solved', {
        p_topic_id: topicId,
        p_post_id: postId
      });
      
      if (error) throw error;
      
      // Invalidar queries para atualizar a interface
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      
      toast({
        title: "Solução marcada",
        description: "A resposta foi marcada como solução!",
      });
      
    } catch (error: any) {
      console.error('Erro ao marcar como solução:', error);
      toast({
        title: "Erro ao marcar como solução",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingSolution(false);
    }
  };

  return {
    handleDeletePost,
    handleMarkAsSolution,
    isDeleting,
    isMarkingSolution,
    canDelete,
    canMarkAsSolution
  };
};
