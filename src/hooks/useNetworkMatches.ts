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
      const { data, error } = await supabase
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
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