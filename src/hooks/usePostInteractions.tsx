
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { deleteForumPost } from "@/lib/supabase/rpc";
import { supabase } from "@/lib/supabase";

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
  
  // Verificar se o usuário pode deletar (autor ou admin)
  const canDelete = user && (user.id === authorId || user.role === 'admin');
  
  // Verificar se pode marcar como solução (precisa ser autor do tópico ou admin)
  const canMarkAsSolution = (topicAuthorId: string) => {
    return user && (user.id === topicAuthorId || user.role === 'admin');
  };

  const handleDeletePost = async () => {
    if (!postId || !topicId) return;
    
    try {
      setIsDeleting(true);
      
      const { success, error } = await deleteForumPost(postId, topicId);
      
      if (!success) {
        throw new Error(error || "Erro desconhecido ao excluir resposta");
      }
      
      // Invalidar queries para atualizar a interface
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic-detail', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      
      toast.success("Resposta excluída com sucesso");
      
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error: any) {
      console.error("Erro ao excluir resposta:", error);
      toast.error(`Erro ao excluir resposta: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsSolution = async (topicAuthorId: string) => {
    if (!canMarkAsSolution(topicAuthorId)) {
      toast.error("Você não tem permissão para marcar esta resposta como solução");
      return;
    }
    
    try {
      setIsMarkingSolution(true);
      
      // Usar a função RPC do Supabase para marcar como solução
      const { data, error } = await supabase.rpc('mark_topic_solved', {
        p_topic_id: topicId,
        p_post_id: postId
      });
      
      if (error) {
        throw error;
      }
      
      // Invalidar queries para atualizar a interface
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic-detail', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      
      toast.success("Resposta marcada como solução!");
      
    } catch (error: any) {
      console.error("Erro ao marcar como solução:", error);
      toast.error(`Erro ao marcar como solução: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsMarkingSolution(false);
    }
  };

  return {
    canDelete,
    canMarkAsSolution,
    isDeleting,
    isMarkingSolution,
    handleDeletePost,
    handleMarkAsSolution
  };
};
