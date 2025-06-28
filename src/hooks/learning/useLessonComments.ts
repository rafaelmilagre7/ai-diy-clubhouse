
import { useQuery } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export interface LessonComment {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
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

  return useQuery({
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
          author: {
            id: user?.id || '1',
            name: user?.name || 'Usuário',
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
};
