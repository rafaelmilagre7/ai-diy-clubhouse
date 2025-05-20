
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTopicSolutionProps {
  topicId: string;
  topicAuthorId: string;
  initialSolvedState?: boolean;
}

export function useTopicSolution({
  topicId,
  topicAuthorId,
  initialSolvedState = false
}: UseTopicSolutionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(initialSolvedState);
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Verifica se o usuário pode marcar como resolvido (autor do tópico ou admin)
  const canMarkAsSolved = user?.id === topicAuthorId || isAdmin;

  const markAsSolved = async (solutionPostId?: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para realizar esta ação");
      return;
    }

    if (!canMarkAsSolved) {
      toast.error("Apenas o autor do tópico ou administradores podem marcar como resolvido");
      return;
    }

    if (!solutionPostId) {
      toast.error("É necessário escolher um post como solução");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('mark_topic_as_solved', {
        topic_id: topicId,
        post_id: solutionPostId
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSolved(true);
      toast.success("Tópico marcado como resolvido com sucesso!");
      
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      queryClient.invalidateQueries({ queryKey: ['forumStats'] });
      
    } catch (error: any) {
      console.error("Erro ao marcar tópico como resolvido:", error);
      toast.error(error.message || "Não foi possível marcar o tópico como resolvido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const unmarkAsSolved = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para realizar esta ação");
      return;
    }

    if (!canMarkAsSolved) {
      toast.error("Apenas o autor do tópico ou administradores podem alterar a resolução do tópico");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('unmark_topic_as_solved', {
        topic_id: topicId
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSolved(false);
      toast.success("Tópico desmarcado como resolvido!");
      
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      queryClient.invalidateQueries({ queryKey: ['forumStats'] });
      
    } catch (error: any) {
      console.error("Erro ao desmarcar tópico como resolvido:", error);
      toast.error(error.message || "Não foi possível desmarcar o tópico como resolvido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSolved,
    isSubmitting,
    canMarkAsSolved,
    markAsSolved,
    unmarkAsSolved
  };
}
