
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
        category: data.category as any, // Conversão de tipo
        url: data.url,
        official_url: data.url, // Mapeamento para official_url
        logo_url: data.logo_url,
        pricing_info: data.pricing_info,
        features: data.features || [],
        is_active: Boolean(data.is_active), // Conversão para boolean
        status: data.is_active ? 'active' : 'inactive', // Mapeamento para status
        tags: [], // Default empty array se não existir
        has_member_benefit: data.benefit_type !== null, // Derivado do benefit_type
        benefit_type: data.benefit_type as any, // Conversão de tipo
        benefit_description: data.benefit_description,
        benefit_link: data.benefit_link || null, // Usar null se não existir
        benefit_discount_percentage: data.benefit_discount_percentage || null, // Usar null se não existir
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return tool;
    },
    enabled: !!toolId && toolId !== 'new',
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};
