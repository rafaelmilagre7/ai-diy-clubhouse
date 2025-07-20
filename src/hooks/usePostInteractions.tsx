
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCommunityPost } from "@/lib/supabase/rpc";
import { CommunityPost } from "@/types/communityTypes";

interface UsePostInteractionsProps {
  post: CommunityPost;
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
    if (!post.id) return;
    
    try {
      setIsDeleting(true);
      
      const { success, error } = await deleteCommunityPost(post.id);
      
      if (!success) {
        throw new Error(error || "Erro desconhecido ao excluir resposta");
      }
      
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
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
