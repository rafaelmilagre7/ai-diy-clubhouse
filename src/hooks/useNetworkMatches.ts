import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useNetworkMatches = () => {
  const query = useQuery({
    queryKey: ['network-matches'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('network_matches')
        .select(`
          id,
          user_id,
          matched_user_id,
          match_type,
          compatibility_score,
          match_reason,
          ai_analysis,
          month_year,
          status,
          created_at,
          profiles!network_matches_matched_user_id_fkey (
            id,
            name,
            company_name,
            current_position,
            industry,
            avatar_url
          )
        `)
        .eq('user_id', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar matches:', error);
        throw error;
      }

      // Transformar dados para o formato esperado pelo componente
      const transformedData = (data || []).map(match => {
        const profile = Array.isArray(match.profiles) ? match.profiles[0] : match.profiles;
        
        return {
          ...match,
          matched_user: profile ? {
            id: profile.id,
            name: profile.name,
            company_name: profile.company_name,
            current_position: profile.current_position,
            industry: profile.industry,
            avatar_url: profile.avatar_url
          } : null
        };
      });

      console.log('🔍 Debug matches transformados:', { 
        total: transformedData.length,
        withUser: transformedData.filter(m => m.matched_user).length,
        withoutUser: transformedData.filter(m => !m.matched_user).length,
        sample: transformedData[0] ? {
          id: transformedData[0].id,
          matched_user_name: transformedData[0].matched_user?.name,
          hasMatchedUser: !!transformedData[0].matched_user
        } : null
      });

      return transformedData.filter(match => match.matched_user) as NetworkMatch[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    ...query,
    matches: query.data || [],
    refetch: query.refetch
  };
};