
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { deleteForumPost } from "@/lib/supabase/rpc";
import { useAuth } from "@/contexts/auth";

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
  
  const isAuthor = user?.id === authorId;
  
  const handleDeletePost = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para excluir um post");
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const result = await deleteForumPost(postId);
      
      if (!result.success) {
        throw new Error(result.error || "Erro ao excluir post");
      }
      
      toast.success("Post excluído com sucesso");
      
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error: any) {
      console.error("Erro ao excluir post:", error);
      toast.error(`Não foi possível excluir o post: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    isAuthor,
    isDeleting,
    handleDeletePost
  };
};
