
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CommunityPost } from "@/types/communityTypes";

interface UsePostItemProps {
  post: CommunityPost;
  topicId: string;
  onSuccess?: () => void;
}

export const usePostItem = ({ post, topicId, onSuccess }: UsePostItemProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isOwner = user?.id === post.user_id;
  const isSolutionPost = post.is_accepted_solution || post.is_solution || false;

  const handleMarkAsSolved = async () => {
    if (!user || !post.id) return;
    
    setIsSubmitting(true);
    try {
      // Marcar post como solução
      const { error: postError } = await supabase
        .from('community_posts')
        .update({ is_solution: true })
        .eq('id', post.id);

      if (postError) throw postError;

      // Marcar tópico como resolvido
      const { error: topicError } = await supabase
        .from('community_topics')
        .update({ is_solved: true })
        .eq('id', topicId);

      if (topicError) throw topicError;

      toast.success("Post marcado como solução!");
      
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao marcar como solução:", error);
      toast.error("Erro ao marcar como solução");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnmarkAsSolved = async () => {
    if (!user || !post.id) return;
    
    setIsSubmitting(true);
    try {
      // Desmarcar post como solução
      const { error: postError } = await supabase
        .from('community_posts')
        .update({ is_solution: false })
        .eq('id', post.id);

      if (postError) throw postError;

      // Desmarcar tópico como resolvido
      const { error: topicError } = await supabase
        .from('community_topics')
        .update({ is_solved: false })
        .eq('id', topicId);

      if (topicError) throw topicError;

      toast.success("Solução removida!");
      
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao remover solução:", error);
      toast.error("Erro ao remover solução");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !post.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast.success("Post excluído com sucesso!");
      
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao excluir post:", error);
      toast.error("Erro ao excluir post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOwner,
    isSolutionPost,
    isSubmitting,
    handleMarkAsSolved,
    handleUnmarkAsSolved,
    handleDeletePost
  };
};
