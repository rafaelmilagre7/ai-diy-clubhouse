
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/hooks/useUser';

interface UseTopicSolutionProps {
  topicId: string;
  topicAuthorId: string;
  initialSolvedState?: boolean;
}

export const useTopicSolution = ({ 
  topicId, 
  topicAuthorId,
  initialSolvedState = false 
}: UseTopicSolutionProps) => {
  const [isSolved, setIsSolved] = useState<boolean>(initialSolvedState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();
  const { profile } = useUser();
  
  // Atualizar o estado quando o initialSolvedState mudar
  useEffect(() => {
    setIsSolved(initialSolvedState);
  }, [initialSolvedState]);

  // Verifica se o usuário pode marcar o tópico como resolvido
  const canMarkAsSolved = !!user && (
    // Autor do tópico ou admin pode marcar como resolvido
    user.id === topicAuthorId || 
    profile?.role === 'admin'
  );

  // Marcar tópico como resolvido
  const markAsSolved = async () => {
    if (!canMarkAsSolved || !topicId) {
      toast.error('Você não tem permissão para marcar este tópico como resolvido');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Marcando tópico como resolvido:', topicId);
      
      // Atualiza o status na tabela forum_topics
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_solved: true })
        .eq('id', topicId);

      if (error) {
        console.error('Erro ao marcar tópico como resolvido:', error);
        toast.error('Não foi possível marcar o tópico como resolvido');
        return;
      }

      setIsSolved(true);
      toast.success('Tópico marcado como resolvido!');
    } catch (error) {
      console.error('Erro ao marcar tópico como resolvido:', error);
      toast.error('Ocorreu um erro ao processar sua solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desmarcar tópico como resolvido
  const unmarkAsSolved = async () => {
    if (!canMarkAsSolved || !topicId) {
      toast.error('Você não tem permissão para modificar este tópico');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Desmarcando tópico como resolvido:', topicId);
      
      // Atualiza o status na tabela forum_topics
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_solved: false })
        .eq('id', topicId);

      if (error) {
        console.error('Erro ao desmarcar tópico como resolvido:', error);
        toast.error('Não foi possível desmarcar o tópico como resolvido');
        return;
      }

      setIsSolved(false);
      toast.success('Tópico desmarcado como resolvido');
    } catch (error) {
      console.error('Erro ao desmarcar tópico como resolvido:', error);
      toast.error('Ocorreu um erro ao processar sua solicitação');
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
};
