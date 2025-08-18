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

      console.log('🔍 [NETWORK-MATCHES] Buscando matches para usuário:', user.user.id);

      // Primeiro, buscar os matches
      const { data: matchesData, error: matchesError } = await supabase
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
          created_at
        `)
        .eq('user_id', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error('🚨 [NETWORK-MATCHES] Erro ao buscar matches:', matchesError);
        throw matchesError;
      }

      if (!matchesData || matchesData.length === 0) {
        console.log('🔍 [NETWORK-MATCHES] Nenhum match encontrado');
        return [];
      }

      // Buscar perfis dos usuários matched
      const matchedUserIds = matchesData.map(match => match.matched_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          company_name,
          current_position,
          industry,
          avatar_url
        `)
        .in('id', matchedUserIds);

      if (profilesError) {
        console.error('🚨 [NETWORK-MATCHES] Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      console.log('🔍 [NETWORK-MATCHES] Dados encontrados:', {
        matches: matchesData.length,
        profiles: profilesData?.length || 0,
        matchedUserIds: matchedUserIds.slice(0, 3) // primeiros 3 IDs para debug
      });

      // Combinar matches com perfis
      const transformedData = matchesData.map(match => {
        const matchedProfile = profilesData?.find(profile => profile.id === match.matched_user_id);
        
        return {
          ...match,
          matched_user: matchedProfile ? {
            id: matchedProfile.id,
            name: matchedProfile.name || 'Usuário',
            company_name: matchedProfile.company_name,
            current_position: matchedProfile.current_position,
            industry: matchedProfile.industry,
            avatar_url: matchedProfile.avatar_url
          } : null
        };
      });

      const validMatches = transformedData.filter(match => match.matched_user);

      console.log('✅ [NETWORK-MATCHES] Matches processados:', { 
        total: transformedData.length,
        withUser: validMatches.length,
        withoutUser: transformedData.length - validMatches.length,
        sample: validMatches[0] ? {
          id: validMatches[0].id,
          matched_user_name: validMatches[0].matched_user?.name,
          matched_user_company: validMatches[0].matched_user?.company_name,
          hasMatchedUser: !!validMatches[0].matched_user
        } : 'Nenhum match válido'
      });

      return validMatches as NetworkMatch[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    ...query,
    matches: query.data || [],
    refetch: query.refetch
  };
};