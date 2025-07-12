import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MatchFilters } from '@/components/networking/MatchFilters';

export interface NetworkMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_type: string;
  compatibility_score: number;
  match_reason: string;
  ai_analysis: {
    strengths: string[];
    opportunities: string[];
    recommended_approach: string;
  };
  month_year: string;
  status: string;
  created_at: string;
  matched_user: {
    id: string;
    name: string;
    company_name?: string;
    current_position?: string;
    industry?: string;
    avatar_url?: string;
  };
}

export const useNetworkMatches = (filters?: MatchFilters) => {
  const query = useQuery({
    queryKey: ['network-matches', filters],
    queryFn: async () => {
      let query = supabase
        .from('network_matches')
        .select(`
          *,
          matched_user:profiles!network_matches_matched_user_id_fkey (
            id,
            name,
            company_name,
            current_position,
            industry,
            avatar_url
          )
        `)
        .eq('status', 'pending');

      // Aplicar filtros se fornecidos
      if (filters) {
        // Filtro por tipos de match
        if (filters.types.length > 0) {
          query = query.in('match_type', filters.types);
        }

        // Filtro por compatibilidade - aplicar apenas se range foi modificado do padrão [0, 100]
        const isCompatibilityFiltered = filters.compatibilityRange[0] > 0 || filters.compatibilityRange[1] < 100;
        
        if (isCompatibilityFiltered) {
          query = query
            .gte('compatibility_score', filters.compatibilityRange[0])
            .lte('compatibility_score', filters.compatibilityRange[1]);
        }

        // Filtro "apenas não lidos" - por enquanto vamos considerar todos como não lidos
        // TODO: Implementar sistema de leitura de matches
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar matches:', error);
        throw error;
      }
      return (data || []) as NetworkMatch[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    ...query,
    matches: query.data || [],
    refetch: query.refetch
  };
};