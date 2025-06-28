
import { useQuery } from '@tanstack/react-query';
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const useFetchModuleComments = (solutionId: string, moduleId: string) => {
  const { log, logError } = useLogging();
  const { user } = useSimpleAuth();

  return useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      try {
        log('Buscando comentários da solução', { solutionId, moduleId });
        
        // Simulate since table doesn't exist in current schema
        console.log('Simulando busca de comentários do módulo:', solutionId, moduleId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return mock organized comments
        const organizedComments = [
          {
            id: '1',
            content: 'Este é um comentário de exemplo para o módulo',
            user_id: 'user-1',
            tool_id: solutionId,
            parent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            likes_count: 2,
            user_has_liked: false,
            profiles: {
              id: 'user-1',
              name: 'Usuário Exemplo',
              avatar_url: null,
              role: 'member'
            },
            replies: [
              {
                id: '2',
                content: 'Esta é uma resposta ao comentário',
                user_id: 'user-2',
                tool_id: solutionId,
                parent_id: '1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                likes_count: 1,
                user_has_liked: false,
                profiles: {
                  id: 'user-2',
                  name: 'Outro Usuário',
                  avatar_url: null,
                  role: 'member'
                }
              }
            ]
          }
        ];

        log('Comentários carregados com sucesso', { 
          total: organizedComments.length
        });
        
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        throw error;
      }
    },
    staleTime: 30000,
    enabled: !!solutionId && !!moduleId,
    retry: 1
  });
};
