import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NetworkMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_type: 'customer' | 'supplier';
  compatibility_score: number;
  match_reason: string;
  match_strengths?: {
    factor: string;
    strength: number;
    description: string;
  }[];
  suggested_topics?: string[];
  ai_analysis: {
    opportunities?: string[];
    recommendedApproach?: string;
    strengths?: string[];
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
    whatsapp_number?: string;
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

      // Verificar se o onboarding está completo (SEM exceção para admin)
      const { data: onboardingData } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .maybeSingle();

      if (!onboardingData) {
        // Verificar fallback no quick_onboarding
        const { data: quickOnboardingData } = await supabase
          .from('quick_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!quickOnboardingData?.is_completed) {
          console.log('🚫 Networking bloqueado: onboarding incompleto');
          
          // LIMPAR matches existentes se onboarding incompleto
          console.log('🧹 Limpando matches existentes...');
          await supabase
            .from('network_matches')
            .delete()
            .eq('user_id', user.id);
          
          return [];
        }
      }

      // Buscar matches existentes
      let query = supabase
        .from('network_matches')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('compatibility_score', { ascending: false });

      if (matchType) {
        query = query.eq('match_type', matchType);
      }

      const { data: matches, error: matchesError } = await query;

      if (matchesError) {
        console.error('❌ Erro ao buscar matches:', matchesError);
        throw matchesError;
      }

      console.log(`✅ Matches encontrados: ${matches?.length || 0}`, matches);

      // Se não há matches, retornar array vazio
      if (!matches || matches.length === 0) {
        return [];
      }

      // Buscar dados dos usuários matched separadamente
      const matchedUserIds = matches.map(match => match.matched_user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, company_name, current_position, avatar_url, whatsapp_number')
        .in('id', matchedUserIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      console.log('✅ Perfis encontrados:', profiles?.length || 0, profiles);

      // Combinar matches com dados dos usuários
      const transformedData = matches.map(match => {
        const matchedUser = profiles?.find(profile => profile.id === match.matched_user_id);
        
        return {
          ...match,
          matched_user: matchedUser ? {
            id: matchedUser.id,
            name: matchedUser.name || 'Usuário',
            email: matchedUser.email,
            company_name: matchedUser.company_name,
            current_position: matchedUser.current_position,
            avatar_url: matchedUser.avatar_url,
            whatsapp_number: matchedUser.whatsapp_number
          } : {
            id: match.matched_user_id,
            name: 'Usuário',
            email: 'email@exemplo.com',
            company_name: 'Empresa',
            current_position: 'Posição',
            avatar_url: null,
            whatsapp_number: null
          }
        };
      });

      console.log('✅ Dados transformados:', transformedData);
      return transformedData as NetworkMatch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
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
