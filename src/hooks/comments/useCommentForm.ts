
import { useState } from 'react';
import { toast } from 'sonner';

export const useCommentForm = (toolId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('Por favor, escreva um comentário');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Simulate comment submission since table doesn't exist
      console.log('Simulando envio de comentário:', {
        content,
        toolId,
        parentId
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Comentário enviado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar comentário');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitComment,
    isSubmitting
  };
};
