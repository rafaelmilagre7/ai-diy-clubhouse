
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NetworkMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_type: 'customer' | 'supplier';
  compatibility_score: number;
  match_reason: string;
  ai_analysis: {
    strengths?: string[];
    opportunities?: string[];
    recommended_approach?: string;
  };
  month_year: string;
  status: 'pending' | 'viewed' | 'contacted' | 'dismissed';
  is_viewed: boolean;
  created_at: string;
  updated_at: string;
  // Dados do usuário matched
  matched_user?: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
}

export function useNetworkMatches(matchType?: 'customer' | 'supplier') {
  return useQuery({
    queryKey: ['network-matches', matchType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔍 Buscando matches para usuário:', user.id);

      // Primeiro, tentar gerar matches se não existir nenhum
      try {
        console.log('🤖 Tentando gerar matches automaticamente...');
        const { data: generateResult, error: generateError } = await supabase.functions.invoke('generate-networking-matches', {
          body: { target_user_id: user.id, force_regenerate: false }
        });
        
        if (generateError) {
          console.log('❌ Erro ao gerar matches automaticamente:', generateError);
        } else {
          console.log('✅ Resultado da geração:', generateResult);
        }
      } catch (error) {
        console.log('❌ Exceção ao gerar matches automaticamente:', error);
        // Continuar mesmo se não conseguir gerar matches
      }

      // Buscar matches com join para os dados do usuário
      let query = supabase
        .from('network_matches')
        .select(`
          *,
          matched_user:profiles!network_matches_matched_user_id_fkey(
            id, name, email, company_name, current_position, avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (matchType) {
        query = query.eq('match_type', matchType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar matches:', error);
        throw error;
      }

      console.log(`✅ Matches encontrados: ${data?.length || 0}`, data);
      
      // Transformar os dados para incluir matched_user na estrutura esperada
      const transformedData = (data || []).map(match => ({
        ...match,
        matched_user: match.matched_user ? {
          id: match.matched_user.id,
          name: match.matched_user.name,
          email: match.matched_user.email,
          company_name: match.matched_user.company_name,
          current_position: match.matched_user.current_position,
          avatar_url: match.matched_user.avatar_url
        } : undefined
      }));

      return transformedData as NetworkMatch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

export function useUpdateMatchStatus() {
  return async (matchId: string, status: NetworkMatch['status']) => {
    const { error } = await supabase
      .from('network_matches')
      .update({ 
        status,
        is_viewed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      throw error;
    }
  };
}
