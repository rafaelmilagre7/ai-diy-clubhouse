
import { useQuery } from '@tanstack/react-query';
import { Comment } from '@/types/commentTypes';

export const useFetchComments = (solutionId: string, moduleId: string) => {
  return useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async (): Promise<Comment[]> => {
      console.log('Simulando busca de comentários para solução:', solutionId, 'módulo:', moduleId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock comments
      return [
        {
          id: '1',
          content: 'Comentário de exemplo para demonstração',
          user_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes_count: 0,
          user_has_liked: false,
          profiles: {
            name: 'Usuário Exemplo',
            avatar_url: null
          }
        }
      ];
    },
    enabled: !!(solutionId && moduleId),
    staleTime: 30 * 1000
  });
};
