
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface UseTopicSolutionProps {
  topicId: string;
  topicAuthorId: string;
}

export const useTopicSolution = ({ topicId, topicAuthorId }: UseTopicSolutionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const canMarkAsSolved = user?.id === topicAuthorId;

  const markPostAsSolution = async (postId: string) => {
    if (!canMarkAsSolved || !user) return;
    
    setIsSubmitting(true);
    try {
      // Primeiro, desmarcar qualquer solução existente no tópico
      await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('topic_id', topicId);

      // Marcar o post específico como solução
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId);

      if (postError) throw postError;

      // Marcar o tópico como resolvido
      const { error: topicError } = await supabase
        .from('forum_topics')
        .update({ is_solved: true })
        .eq('id', topicId);

      if (topicError) throw topicError;

      toast.success("Post marcado como solução!");
      
      // Invalidar caches
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
    } catch (error: any) {
      console.error("Erro ao marcar como solução:", error);
      toast.error("Erro ao marcar como solução");
    } finally {
      setIsSubmitting(false);
    }
  };

  const unmarkPostAsSolution = async (postId: string) => {
    if (!canMarkAsSolved || !user) return;
    
    setIsSubmitting(true);
    try {
      // Desmarcar post como solução
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('id', postId);

      if (postError) throw postError;

      // Desmarcar tópico como resolvido
      const { error: topicError } = await supabase
        .from('forum_topics')
        .update({ is_solved: false })
        .eq('id', topicId);

      if (topicError) throw topicError;

      toast.success("Solução removida!");
      
      // Invalidar caches
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
    } catch (error: any) {
      console.error("Erro ao remover solução:", error);
      toast.error("Erro ao remover solução");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    canMarkAsSolved,
    isSubmitting,
    markPostAsSolution,
    unmarkPostAsSolution
  };
};
