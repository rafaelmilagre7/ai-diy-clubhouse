
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useAuth } from '@/contexts/auth';

export const useTools = (options?: { 
  checkAccessRestrictions?: boolean;
  categoryFilter?: string;
  benefitsOnly?: boolean;
}) => {
  const { user } = useAuth();
  const opts = {
    checkAccessRestrictions: true,
    ...options
  };

  const query = useQuery<Tool[], Error>({
    queryKey: ['tools', user?.id, opts.categoryFilter, opts.benefitsOnly],
    queryFn: async () => {
      console.log('Buscando ferramentas...');
      
      // Buscar todas as ferramentas
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', true as any)
        .order('name');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }

      // Filtrar por categoria, se especificado
      let filteredData = data as any;
      if (opts.categoryFilter) {
        filteredData = (data as any).filter((tool: any) => tool.category === opts.categoryFilter);
      }

      // Filtrar apenas benefícios, se solicitado
      if (opts.benefitsOnly) {
        filteredData = filteredData.filter((tool: any) => tool.has_member_benefit);
      }

      // Verificar restrições de acesso para benefícios, se autenticado e solicitado
      if (user && opts.checkAccessRestrictions) {
        // Verificar quais ferramentas têm restrições de acesso
        const { data: restrictedToolsData } = await supabase
          .from('benefit_access_control')
          .select('tool_id')
          .order('tool_id');

        const restrictedTools = new Set((restrictedToolsData as any)?.map((rt: any) => rt.tool_id) || []);

        // Para cada ferramenta com restrições, verificar acesso (mock implementation)
        if (restrictedTools.size > 0) {
          // Simplified access check without calling non-existent RPC
          filteredData = filteredData.map((tool: any) => ({
            ...tool,
            is_access_restricted: restrictedTools.has(tool.id),
            has_access: !restrictedTools.has(tool.id) || true // Mock: always grant access
          }));
        } else {
          // Se não houver restrições, todos têm acesso
          filteredData = filteredData.map((tool: any) => ({
            ...tool,
            is_access_restricted: false,
            has_access: true
          }));
        }
      }

      const toolsWithLogosInfo = filteredData.map((tool: any) => ({
        ...tool,
        has_valid_logo: !!tool.logo_url
      }));

      console.log('Ferramentas encontradas:', { 
        total: filteredData.length,
        comLogo: toolsWithLogosInfo.filter((t: any) => t.has_valid_logo).length,
        semLogo: toolsWithLogosInfo.filter((t: any) => !t.has_valid_logo).length
      });

      return toolsWithLogosInfo as Tool[];
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
