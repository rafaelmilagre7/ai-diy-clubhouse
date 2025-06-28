
import { useQuery } from '@tanstack/react-query';

export interface MaterialItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'link';
  url: string;
  description?: string;
  size?: number;
  created_at: string;
}

// Export Material as alias for MaterialItem for compatibility
export type Material = MaterialItem;

export const useMaterialsData = (solutionIdOrModule?: string | { id: string }) => {
  const solutionId = typeof solutionIdOrModule === 'string' 
    ? solutionIdOrModule 
    : solutionIdOrModule?.id;

  const query = useQuery({
    queryKey: ['materials', solutionId],
    queryFn: async (): Promise<MaterialItem[]> => {
      if (!solutionId) return [];

      console.log('Simulando busca de materiais para solução:', solutionId);
      
      // Return mock data
      return [
        {
          id: '1',
          name: 'Guia de Implementação.pdf',
          type: 'pdf',
          url: '/materials/guia-implementacao.pdf',
          description: 'Guia completo para implementação da solução',
          size: 2048000,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Template de Configuração',
          type: 'link',
          url: 'https://exemplo.com/template',
          description: 'Template pronto para usar',
          created_at: new Date().toISOString()
        }
      ];
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000
  });

  return {
    ...query,
    materials: query.data || [],
    loading: query.isLoading
  };
};
