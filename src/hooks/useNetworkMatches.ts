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
    email?: string;
    company_name?: string;
    current_position?: string;
    industry?: string;
    avatar_url?: string;
    linkedin_url?: string;
    whatsapp_number?: string;
    professional_bio?: string;
    // Dados do onboarding
    phone?: string;
    full_company_name?: string;
    full_position?: string;
    full_industry?: string;
    company_size?: string;
    annual_revenue?: string;
  };
}

export const useNetworkMatches = () => {
  const query = useQuery({
    queryKey: ['network-matches'],
    queryFn: async () => {
      console.log('🔄 [NETWORK-MATCHES] Executando query para buscar matches...');
      
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

      // Buscar perfis dos usuários matched com dados completos
      const matchedUserIds = matchesData.map(match => match.matched_user_id);
      
      // Fase 1: Buscar perfis com tratamento robusto de erros
      let profilesData: any[] = [];
      try {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            company_name,
            current_position,
            industry,
            avatar_url,
            linkedin_url,
            whatsapp_number,
            professional_bio
          `)
          .in('id', matchedUserIds);

        if (profilesError) {
          console.error('⚠️ [NETWORK-MATCHES] Erro ao buscar perfis (continuando):', profilesError);
        } else {
          profilesData = data || [];
          console.log(`👥 [NETWORK-MATCHES] ${profilesData.length} perfis encontrados de ${matchedUserIds.length} esperados`);
        }
      } catch (error) {
        console.error('🚨 [NETWORK-MATCHES] Exceção ao buscar perfis:', error);
      }

      // Fase 2: Buscar dados de contato via função segura (OPCIONAL - não bloqueia)
      let onboardingData: any[] = [];
      try {
        const { data, error: onboardingError } = await supabase
          .rpc('get_networking_contacts', { p_user_ids: matchedUserIds });

        if (onboardingError) {
          console.warn('⚠️ [NETWORK-MATCHES] RPC onboarding falhou (esperado para usuários sem onboarding):', onboardingError.message);
        } else {
          onboardingData = data || [];
          console.log(`📋 [NETWORK-MATCHES] ${onboardingData.length} dados de onboarding encontrados`);
        }
      } catch (error) {
        console.warn('⚠️ [NETWORK-MATCHES] Exceção no RPC onboarding (ignorado):', error);
      }

      console.log('🔍 [NETWORK-MATCHES] Dados encontrados:', {
        matches: matchesData.length,
        profiles: profilesData?.length || 0,
        matchedUserIds: matchedUserIds.slice(0, 3), // primeiros 3 IDs para debug
        profilesSample: profilesData?.slice(0, 2).map(p => ({
          id: p.id,
          name: p.name,
          hasAvatar: !!p.avatar_url,
          avatar_url: p.avatar_url
        }))
      });

      // Fase 3: Combinar matches com perfis e dados de onboarding
      const transformedData = matchesData.map(match => {
        const matchedProfile = profilesData.find(profile => profile.id === match.matched_user_id);
        const onboardingInfo = onboardingData.find(onb => onb.user_id === match.matched_user_id);
        
        // Se não achou perfil, criar dados mínimos do match
        if (!matchedProfile) {
          console.warn(`⚠️ [NETWORK-MATCHES] Perfil não encontrado para match ${match.matched_user_id} - usando fallback`);
          return {
            ...match,
            matched_user: {
              id: match.matched_user_id,
              name: onboardingInfo?.full_name || 'Membro Viver de IA',
              email: onboardingInfo?.email || undefined,
              company_name: onboardingInfo?.company_name,
              current_position: onboardingInfo?.current_position,
              avatar_url: onboardingInfo?.profile_picture,
              industry: onboardingInfo?.industry,
              linkedin_url: undefined,
              whatsapp_number: undefined,
              professional_bio: undefined,
              phone: onboardingInfo?.phone,
              full_company_name: onboardingInfo?.company_name,
              full_position: onboardingInfo?.current_position,
              full_industry: onboardingInfo?.industry,
              company_size: undefined,
              annual_revenue: undefined,
            }
          };
        }

        // Perfil encontrado - combinar com dados de onboarding
        return {
          ...match,
          matched_user: {
            id: matchedProfile.id,
            name: matchedProfile.name || 'Usuário',
            email: matchedProfile.email,
            company_name: matchedProfile.company_name || onboardingInfo?.company_name,
            current_position: matchedProfile.current_position || onboardingInfo?.current_position,
            industry: matchedProfile.industry,
            avatar_url: matchedProfile.avatar_url || onboardingInfo?.profile_picture,
            linkedin_url: matchedProfile.linkedin_url || onboardingInfo?.linkedin_url,
            whatsapp_number: matchedProfile.whatsapp_number,
            professional_bio: matchedProfile.professional_bio,
            // Dados extras vindos do RPC
            phone: onboardingInfo?.phone || matchedProfile.whatsapp_number,
            full_company_name: onboardingInfo?.company_name,
            full_position: onboardingInfo?.current_position,
            full_industry: matchedProfile.industry,
            company_size: undefined,
            annual_revenue: undefined,
          }
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