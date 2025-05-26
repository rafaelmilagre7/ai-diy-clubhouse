
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteForumPost } from "@/lib/supabase/rpc";
import { Post } from "@/types/forumTypes";

interface UsePostInteractionsProps {
  post: Post;
  topicId: string;
  onReplyAdded?: () => void;
}

export const usePostInteractions = ({
  post,
  topicId,
  onReplyAdded
}: UsePostInteractionsProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onReplyAdded) onReplyAdded();
  };

  const handleDeletePost = async () => {
    if (!post.id || !topicId) return;
    
    try {
      setIsDeleting(true);
      
      const { success, error } = await deleteForumPost(post.id, topicId);
      
      if (!success) {
        throw new Error(error || "Erro desconhecido ao excluir resposta");
      }
      
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      toast.success("Resposta excluída com sucesso");
      
      if (onReplyAdded) {
        onReplyAdded();
      }
    } catch (error: any) {
      console.error("Erro ao excluir resposta:", error);
      toast.error(`Erro ao excluir resposta: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
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
