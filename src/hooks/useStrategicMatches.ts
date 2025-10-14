import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface StrategicMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_type: string;
  compatibility_score: number;
  why_connect: string;
  opportunities: string[];
  ice_breaker: string;
  ai_analysis?: {
    match_type?: string;
    persona_alignment?: number;
    strategic_fit?: number;
    networking_score_delta?: number;
  };
  status: string;
  created_at: string;
  matched_user?: {
    id: string;
    name?: string;
    email?: string;
    company_name?: string;
    current_position?: string;
    industry?: string;
    avatar_url?: string;
    linkedin_url?: string;
    whatsapp_number?: string;
    professional_bio?: string;
    company_size?: string;
    annual_revenue?: string;
  } | null;
}

export const useStrategicMatches = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['strategic-matches-v2', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Tentar buscar da nova tabela strategic_matches_v2
      const { data: newMatches, error: newError } = await supabase
        .from('strategic_matches_v2')
        .select(`
          id,
          user_id,
          matched_user_id,
          match_type,
          compatibility_score,
          why_connect,
          opportunities,
          ice_breaker,
          ai_analysis,
          status,
          created_at,
          matched_user:profiles!strategic_matches_v2_matched_user_id_fkey(
            id,
            name,
            email,
            company_name,
            current_position,
            industry,
            avatar_url,
            linkedin_url,
            whatsapp_number,
            professional_bio,
            company_size,
            annual_revenue
          )
        `)
        .eq('user_id', user.id)
        .order('compatibility_score', { ascending: false });

      // Se encontrou matches na nova tabela, retornar
      if (!newError && newMatches && newMatches.length > 0) {
        console.log('✅ [STRATEGIC MATCHES] Usando dados da tabela v2:', newMatches.length);
        // Fix matched_user: pegar primeiro elemento se for array
        const fixedMatches = newMatches.map(match => ({
          ...match,
          matched_user: Array.isArray(match.matched_user) ? match.matched_user[0] : match.matched_user
        }));
        return fixedMatches as StrategicMatch[];
      }

      // FALLBACK: Buscar da tabela antiga network_matches
      console.log('⚠️ [STRATEGIC MATCHES] Nenhum match na v2, usando fallback...');
      
      const { data: oldMatches, error: oldError } = await supabase
        .from('network_matches')
        .select(`
          id,
          user_id,
          matched_user_id,
          match_type,
          compatibility_score,
          match_reason,
          ai_analysis,
          created_at,
          matched_user:profiles!network_matches_matched_user_id_fkey(
            id,
            name,
            email,
            company_name,
            current_position,
            industry,
            avatar_url,
            linkedin_url,
            whatsapp_number,
            professional_bio,
            company_size,
            annual_revenue
          )
        `)
        .eq('user_id', user.id)
        .order('compatibility_score', { ascending: false });

      if (oldError) throw oldError;

      // Transformar dados antigos para o novo formato
      const transformedMatches: StrategicMatch[] = (oldMatches || []).map(match => ({
        id: match.id,
        user_id: match.user_id,
        matched_user_id: match.matched_user_id,
        match_type: match.match_type || 'strategic',
        compatibility_score: match.compatibility_score || 0.5,
        why_connect: match.match_reason || 'Compatibilidade identificada pela IA',
        opportunities: (match.ai_analysis as any)?.opportunities || ['Networking estratégico'],
        ice_breaker: (match.ai_analysis as any)?.recommended_approach || 'Olá! Vi que temos interesses em comum e gostaria de conectar.',
        ai_analysis: match.ai_analysis as any,
        status: 'pending',
        created_at: match.created_at,
        matched_user: match.matched_user as any
      }));

      console.log('✅ [STRATEGIC MATCHES] Usando fallback com transformação:', transformedMatches.length);
      return transformedMatches;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    matches: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
