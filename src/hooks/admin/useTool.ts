
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';

export const useTool = (toolId: string | null) => {
  return useQuery<Tool | null, Error>({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      if (!toolId || toolId === 'new') {
        return null;
      }

      console.log('Buscando ferramenta:', toolId);
      
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) {
        console.error('Erro ao buscar ferramenta:', error);
        throw error;
      }

      // Mapear os dados do Supabase para o tipo Tool esperado
      const tool: Tool = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category as any,
        url: data.url,
        official_url: data.url, // Use url as fallback
        logo_url: data.logo_url,
        pricing_info: data.pricing_info,
        features: data.features || [],
        is_active: Boolean(data.is_active),
        status: data.is_active ? 'active' : 'inactive',
        tags: [], // Default empty array
        has_member_benefit: data.benefit_type !== null,
        benefit_type: data.benefit_type as any,
        benefit_description: data.benefit_description,
        benefit_link: data.benefit_link || null, // Handle missing property
        benefit_discount_percentage: data.benefit_discount_percentage || null, // Handle missing property
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return tool;
    },
    enabled: !!toolId && toolId !== 'new',
    staleTime: 5 * 60 * 1000
  });
};
