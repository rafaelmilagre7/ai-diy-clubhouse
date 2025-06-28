
import { useQuery } from '@tanstack/react-query';

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  likes_count: number;
  replies?: Comment[];
  parent_id?: string;
}

export const useCommentsData = (toolId?: string) => {
  return useQuery({
    queryKey: ['comments', toolId],
    queryFn: async (): Promise<Comment[]> => {
      if (!toolId) return [];

      // Simulate comments since table doesn't exist
      console.log('Simulando busca de comentários para tool:', toolId);

      // Return mock data
      return [
        {
          id: '1',
          content: 'Excelente ferramenta! Uso diariamente.',
          author: {
            id: 'user1',
            name: 'João Silva'
          },
          created_at: new Date().toISOString(),
          likes_count: 5,
          replies: []
        },
        {
          id: '2',
          content: 'Muito útil para automação de processos.',
          author: {
            id: 'user2',
            name: 'Maria Santos'
          },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          likes_count: 3,
          replies: []
        }
      ];
    },
    enabled: !!toolId,
    staleTime: 5 * 60 * 1000
  });

  // Mock function for adding comments
  const addComment = async (content: string, parentId?: string) => {
    console.log('Simulando adição de comentário:', { content, parentId, toolId });
    return true;
  };

  const deleteComment = async (commentId: string) => {
    console.log('Simulando remoção de comentário:', commentId);
    return true;
  };

  return {
    comments: [],
    loading: false,
    error: null,
    addComment,
    deleteComment
  };
};
