
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useAuth } from '@/contexts/auth';

export const useTools = (options?: { 
  checkAccessRestrictions?: boolean;
  categoryFilter?: string;
  benefitsOnly?: boolean;
  onboardingMode?: boolean; // Nova opção para modo onboarding
}) => {
  const { user } = useAuth();
  const opts = {
    checkAccessRestrictions: true,
    onboardingMode: false,
    ...options
  };

  const query = useQuery<Tool[], Error>({
    queryKey: ['tools', user?.id, opts.categoryFilter, opts.benefitsOnly, opts.onboardingMode],
    queryFn: async () => {
      console.log('Buscando ferramentas...');
      
      // Buscar todas as ferramentas
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }

      // Filtrar por categoria, se especificado
      let filteredData = data;
      if (opts.categoryFilter) {
        filteredData = data.filter(tool => tool.category === opts.categoryFilter);
      }

      // Filtrar apenas benefícios, se solicitado
      if (opts.benefitsOnly) {
        filteredData = filteredData.filter(tool => tool.has_member_benefit);
      }

      // Verificar restrições de acesso para benefícios, se autenticado e solicitado
      // Para modo onboarding, pular verificações de acesso para performance
      if (user && opts.checkAccessRestrictions && !opts.onboardingMode) {
        // Verificar quais ferramentas têm restrições de acesso
        const { data: restrictedToolsData } = await supabase
          .from('benefit_access_control')
          .select('tool_id')
          .order('tool_id');

        const restrictedTools = new Set(restrictedToolsData?.map(rt => rt.tool_id) || []);

        // Para cada ferramenta com restrições, verificar acesso
        if (restrictedTools.size > 0) {
          // Array para armazenar promessas de verificação de acesso
          const accessChecks = filteredData
            .filter(tool => tool.has_member_benefit && restrictedTools.has(tool.id))
            .map(async tool => {
              const { data: hasAccess } = await supabase.rpc('can_access_benefit', {
                user_id: user.id,
                tool_id: tool.id
              });
              
              return {
                toolId: tool.id,
                hasAccess: hasAccess || false
              };
            });

          // Aguardar todas as verificações de acesso
          const accessResults = await Promise.all(accessChecks);
          const accessMap = new Map(accessResults.map(r => [r.toolId, r.hasAccess]));

          // Adicionar flag de acesso restrito para cada ferramenta
          filteredData = filteredData.map(tool => ({
            ...tool,
            is_access_restricted: restrictedTools.has(tool.id),
            has_access: !restrictedTools.has(tool.id) || accessMap.get(tool.id) || false
          }));
        } else {
          // Se não houver restrições, todos têm acesso
          filteredData = filteredData.map(tool => ({
            ...tool,
            is_access_restricted: false,
            has_access: true
          }));
        }
      } else {
        // Para modo onboarding ou quando não há verificação de acesso, 
        // assumir que todos têm acesso
        filteredData = filteredData.map(tool => ({
          ...tool,
          is_access_restricted: false,
          has_access: true
        }));
      }

      const toolsWithLogosInfo = filteredData.map(tool => ({
        ...tool,
        has_valid_logo: !!tool.logo_url
      }));

      console.log('Ferramentas encontradas:', { 
        total: filteredData.length,
        comLogo: toolsWithLogosInfo.filter(t => t.has_valid_logo).length,
        semLogo: toolsWithLogosInfo.filter(t => !t.has_valid_logo).length
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
