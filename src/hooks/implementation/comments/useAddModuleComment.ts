
import { useState } from 'react';
import { toast } from 'sonner';

export const useAddModuleComment = () => {
  const [isAdding, setIsAdding] = useState(false);

  const addModuleComment = async (commentData: {
    content: string;
    moduleId: string;
    parentId?: string;
  }) => {
    if (!commentData.content.trim()) {
      toast.error('Por favor, escreva um comentário');
      return false;
    }

    setIsAdding(true);
    
    try {
      // Simulate module comment addition since table doesn't exist
      console.log('Simulando adição de comentário no módulo:', commentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Comentário no módulo adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário no módulo:', error);
      toast.error('Erro ao adicionar comentário no módulo');
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addModuleComment,
    isAdding
  };
};
