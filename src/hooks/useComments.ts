
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useComments = (suggestionId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const {
    data: comments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => {
      console.log('Simulando busca de comentários para sugestão:', suggestionId);
      
      // Mock data since suggestion_comments table doesn't exist
      return [];
    },
    enabled: !!suggestionId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) {
        throw new Error("Você precisa estar logado para comentar.");
      }

      if (!content.trim()) {
        throw new Error("O comentário não pode estar vazio.");
      }

      console.log("Simulando adição de comentário:", { suggestionId, content, userId: user.id });

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { id: Date.now().toString(), content, user_id: user.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestion-comments', suggestionId] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      setNewComment('');
      toast.success("Comentário adicionado com sucesso!");
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    }
  });

  return {
    comments,
    isLoading,
    error,
    newComment,
    setNewComment,
    addComment: (content: string) => addCommentMutation.mutateAsync(content),
    isAddingComment: addCommentMutation.isPending
  };
};
