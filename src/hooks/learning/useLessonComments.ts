
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { toast } from 'sonner';

export interface LessonComment {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  is_hidden: boolean;
  author: {
    id: string;
    name: string;
    email: string;
  };
  likes_count: number;
  is_liked: boolean;
}

export const useLessonComments = (lessonId: string) => {
  const { user } = useSimpleAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: async (): Promise<LessonComment[]> => {
      if (!lessonId) return [];

      console.log('Simulando busca de comentários da lição:', lessonId);

      // Mock comments data since table doesn't exist
      return [
        {
          id: '1',
          lesson_id: lessonId,
          user_id: user?.id || '1',
          content: 'Excelente lição! Muito esclarecedora.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          parent_id: null,
          is_hidden: false,
          author: {
            id: user?.id || '1',
            name: user?.email?.split('@')[0] || 'Usuário', // Use email prefix as name
            email: user?.email || 'usuario@exemplo.com'
          },
          likes_count: 3,
          is_liked: false
        }
      ];
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      console.log('Simulando adição de comentário:', { content, parentId });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
      toast.success('Comentário adicionado com sucesso!');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      console.log('Simulando exclusão de comentário:', commentId);
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
      toast.success('Comentário excluído com sucesso!');
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      console.log('Simulando like do comentário:', commentId);
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
    }
  });

  return {
    ...query,
    comments: query.data || [],
    addComment: async (content: string, parentId?: string | null) => {
      return addCommentMutation.mutateAsync({ content, parentId: parentId || undefined });
    },
    deleteComment: async (commentId: string) => {
      return deleteCommentMutation.mutateAsync(commentId);
    },
    likeComment: async (commentId: string) => {
      return likeCommentMutation.mutateAsync(commentId);
    },
    isSubmitting: addCommentMutation.isPending
  };
};
