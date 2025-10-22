/**
 * HOOK UNIFICADO DE TOOLS
 * 
 * Consolida useTools e useOptimizedTools em uma única implementação otimizada.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useAuth } from '@/contexts/auth';

export const useUnifiedTools = (options?: { 
  checkAccessRestrictions?: boolean;
  categoryFilter?: string;
  benefitsOnly?: boolean;
  onboardingMode?: boolean;
}) => {
  const { user } = useAuth();
  const opts = {
    checkAccessRestrictions: true,
    onboardingMode: false,
    ...options
  };

  const query = useQuery<Tool[], Error>({
    queryKey: ['unified-tools', user?.id, opts.categoryFilter, opts.benefitsOnly, opts.onboardingMode],
    queryFn: async () => {
      console.log('Buscando ferramentas (unified)...');
      
      try {
        // Buscar ferramentas ativas
        const { data: toolsData, error: toolsError } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true)
          .order('name');

        if (toolsError) {
          console.error('Erro ao buscar ferramentas:', toolsError);
          throw toolsError;
        }

        if (!toolsData || toolsData.length === 0) {
          return [];
        }

        // Aplicar filtros
        let filteredData = toolsData;
        
        if (opts.categoryFilter) {
          filteredData = toolsData.filter(tool => tool.category === opts.categoryFilter);
        }

        if (opts.benefitsOnly) {
          filteredData = filteredData.filter(tool => tool.has_member_benefit);
        }

        // Verificar restrições de acesso (pular em modo onboarding para performance)
        if (user && opts.checkAccessRestrictions && !opts.onboardingMode) {
          // Buscar restrições em batch
          const { data: accessControlData } = await supabase
            .from('benefit_access_control')
            .select('tool_id, role_id')
            .in('tool_id', filteredData.map(t => t.id));

          // Criar mapa de restrições
          const restrictionsMap = new Map<string, string[]>();
          (accessControlData || []).forEach(control => {
            if (!restrictionsMap.has(control.tool_id)) {
              restrictionsMap.set(control.tool_id, []);
            }
            restrictionsMap.get(control.tool_id)?.push(control.role_id);
          });

          // Buscar role do usuário
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role_id, user_roles:role_id(name)')
            .eq('id', user.id)
            .single();

          const userRoleId = userProfile?.role_id;
          const isAdmin = (userProfile?.user_roles as any)?.name === 'admin';

          // Processar acesso
          filteredData = filteredData.map(tool => {
            const restrictions = restrictionsMap.get(tool.id);
            const isRestricted = !!(restrictions && restrictions.length > 0);
            
            let hasAccess = true;
            if (isRestricted && !isAdmin) {
              hasAccess = !!(userRoleId && restrictions?.includes(userRoleId));
            }

            return {
              ...tool,
              is_access_restricted: isRestricted,
              has_access: hasAccess,
              benefit_type: tool.benefit_type || 'standard',
              has_valid_logo: !!tool.logo_url
            };
          });
        } else {
          // Sem verificação: todos têm acesso
          filteredData = filteredData.map(tool => ({
            ...tool,
            is_access_restricted: false,
            has_access: true,
            benefit_type: tool.benefit_type || 'standard',
            has_valid_logo: !!tool.logo_url
          }));
        }

        console.log('Ferramentas unified encontradas:', { 
          total: filteredData.length,
          comLogo: filteredData.filter(t => t.has_valid_logo).length,
          beneficios: filteredData.filter(t => t.has_member_benefit).length
        });

        return filteredData as Tool[];
      } catch (error) {
        console.error('Erro na query unified de ferramentas:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};

// Aliases para compatibilidade
export const useTools = useUnifiedTools;
export const useOptimizedTools = useUnifiedTools;
