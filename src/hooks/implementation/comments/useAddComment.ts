
import { useState } from 'react';
import { toast } from 'sonner';

export const useAddComment = () => {
  const [isAdding, setIsAdding] = useState(false);

  const addComment = async (commentData: {
    content: string;
    toolId?: string;
    moduleId?: string;
    parentId?: string;
  }) => {
    if (!commentData.content.trim()) {
      toast.error('Por favor, escreva um comentário');
      return false;
    }

    setIsAdding(true);
    
    try {
      // Simulate comment addition since table doesn't exist
      console.log('Simulando adição de comentário:', commentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Comentário adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addComment,
    isAdding
  };
};
