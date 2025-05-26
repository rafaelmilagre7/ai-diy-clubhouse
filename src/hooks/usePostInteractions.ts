
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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeletePost = async () => {
    if (!user) return;

    // Verificar se é o autor ou admin
    const isAuthor = user.id === authorId;
    const isAdmin = user.role === 'admin'; // Ajustar conforme sua estrutura de auth

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

  return {
    handleDeletePost,
    isDeleting
  };
};
