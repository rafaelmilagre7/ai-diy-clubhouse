
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { toast } from 'sonner';

export const useLikeComment = (solutionId: string) => {
  const { user } = useSimpleAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Simulando like/unlike do comentário:', commentId, 'liked:', !isLiked);
      
      // Simulate API call since table doesn't exist
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { success: true, liked: !isLiked };
    },
    onSuccess: () => {
      // Invalidate comments queries
      queryClient.invalidateQueries({
        queryKey: ['solution-comments', solutionId]
      });
    },
    onError: (error) => {
      console.error('Erro ao curtir comentário:', error);
      toast.error('Erro ao curtir comentário');
    }
  });

  const likeComment = (commentId: string, isLiked: boolean) => {
    mutation.mutate({ commentId, isLiked });
  };

  return { likeComment };
};
