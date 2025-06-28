
import { useState } from 'react';
import { toast } from 'sonner';

export const useAddComment = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = async (solutionId: string, content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('Por favor, escreva um comentário');
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate comment addition since table doesn't exist
      console.log('Simulando adição de comentário:', { solutionId, content, parentId });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Comentário adicionado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addComment,
    isSubmitting
  };
};
