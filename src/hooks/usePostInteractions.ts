
import { useState } from "react";
import { Post } from "@/types/forumTypes";
import { deleteForumPost } from "@/lib/supabase/rpc";
import { toast } from "sonner";

interface UsePostInteractionsProps {
  post: Post;
  topicId: string;
  onReplyAdded?: () => void;
}

export const usePostInteractions = ({ post, topicId, onReplyAdded }: UsePostInteractionsProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alternar visibilidade do formulário de resposta
  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  // Abrir diálogo de confirmação de exclusão
  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  // Fechar diálogo de confirmação de exclusão
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  // Manipulador para quando uma resposta é adicionada com sucesso
  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onReplyAdded) {
      onReplyAdded();
    }
    toast.success("Sua resposta foi adicionada com sucesso!");
  };

  // Manipulador para excluir um post
  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const { success, error } = await deleteForumPost(post.id);
      
      if (!success) {
        throw new Error(error || "Erro ao excluir postagem");
      }
      
      toast.success("Postagem excluída com sucesso!");
      closeDeleteDialog();
      
      // Se houver callback de onReplyAdded, chamá-lo para atualizar a lista
      if (onReplyAdded) {
        onReplyAdded();
      }
    } catch (error: any) {
      console.error("Erro ao excluir postagem:", error);
      toast.error(error.message || "Não foi possível excluir a postagem");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    showReplyForm,
    showDeleteDialog,
    isDeleting,
    toggleReplyForm,
    openDeleteDialog,
    closeDeleteDialog,
    handleReplySuccess,
    handleDeletePost
  };
};
