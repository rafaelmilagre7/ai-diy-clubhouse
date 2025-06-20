
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseTopicSolutionProps {
  topicId: string;
  topicAuthorId: string;
  initialSolvedState: boolean;
}

export const useTopicSolution = ({
  topicId,
  topicAuthorId,
  initialSolvedState = false
}: UseTopicSolutionProps) => {
  const [isSolved, setIsSolved] = useState<boolean>(initialSolvedState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Verificar se o usuário atual é o autor do tópico ou um administrador
  const canMarkAsSolved = async (): Promise<boolean> => {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      // Se é o autor do tópico
      if (user.id === topicAuthorId) return true;
      
      // Se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id as any)
        .single();
        
      return (profile as any)?.role === 'admin';
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return false;
    }
  };

  // Marcar tópico como resolvido
  const markAsSolved = async () => {
    try {
      setIsSubmitting(true);
      
      // Atualizar o tópico para ser marcado como resolvido
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_solved: true } as any)
        .eq('id', topicId as any);
        
      if (error) throw error;
      
      setIsSolved(true);
      toast.success("Tópico marcado como resolvido");
      
    } catch (error: any) {
      console.error("Erro ao marcar tópico como resolvido:", error);
      toast.error(`Não foi possível marcar o tópico como resolvido: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remover marcação de resolvido
  const unmarkAsSolved = async () => {
    try {
      setIsSubmitting(true);
      
      // Atualizar o tópico para não estar resolvido
      const { error: topicError } = await supabase
        .from('forum_topics')
        .update({ is_solved: false } as any)
        .eq('id', topicId as any);
        
      if (topicError) throw topicError;
      
      // Também remover a marcação de solução de todos os posts relacionados
      const { error: postsError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false } as any)
        .eq('topic_id', topicId as any);
        
      if (postsError) {
        console.error("Erro ao limpar soluções dos posts:", postsError);
      }
      
      setIsSolved(false);
      toast.success("Marcação de solução removida");
      
    } catch (error: any) {
      console.error("Erro ao desmarcar tópico como resolvido:", error);
      toast.error(`Não foi possível remover a marcação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSolved,
    isSubmitting,
    canMarkAsSolved: canMarkAsSolved(),
    markAsSolved,
    unmarkAsSolved
  };
};
