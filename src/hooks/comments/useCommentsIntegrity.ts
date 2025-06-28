
import { useQuery } from '@tanstack/react-query';

export const useCommentsIntegrity = (toolId?: string) => {
  return useQuery({
    queryKey: ['comments-integrity', toolId],
    queryFn: async () => {
      if (!toolId) return { isValid: true, issues: [] };

      // Simulate integrity check since table doesn't exist
      console.log('Simulando verificação de integridade de comentários para tool:', toolId);
      
      return {
        isValid: true,
        issues: [],
        orphanedComments: 0,
        duplicatedComments: 0,
        malformedComments: 0
      };
    },
    enabled: !!toolId,
    staleTime: 5 * 60 * 1000
  });
};
