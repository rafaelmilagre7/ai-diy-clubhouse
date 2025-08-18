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
      const { data: profilesData, error: profilesError } = await supabase
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

      // Buscar dados de onboarding para informações adicionais
      const { data: onboardingData } = await supabase
        .from('onboarding_final')
        .select(`
          user_id,
          personal_info,
          business_info,
          professional_info
        `)
        .in('user_id', matchedUserIds);

      if (profilesError) {
        console.error('🚨 [NETWORK-MATCHES] Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      console.log('🔍 [NETWORK-MATCHES] Dados encontrados:', {
        matches: matchesData.length,
        profiles: profilesData?.length || 0,
        matchedUserIds: matchedUserIds.slice(0, 3) // primeiros 3 IDs para debug
      });

      // Combinar matches com perfis e dados de onboarding
      const transformedData = matchesData.map(match => {
        const matchedProfile = profilesData?.find(profile => profile.id === match.matched_user_id);
        const onboardingInfo = onboardingData?.find(onb => onb.user_id === match.matched_user_id);
        
        if (!matchedProfile) return { ...match, matched_user: null };

        // Extrair dados do onboarding
        const personalInfo = onboardingInfo?.personal_info || {};
        const businessInfo = onboardingInfo?.business_info || {};
        const professionalInfo = onboardingInfo?.professional_info || {};

        return {
          ...match,
          matched_user: {
            id: matchedProfile.id,
            name: matchedProfile.name || personalInfo.name || 'Usuário',
            email: matchedProfile.email,
            company_name: matchedProfile.company_name || businessInfo.company_name || professionalInfo.company_name,
            current_position: matchedProfile.current_position || businessInfo.current_position || professionalInfo.current_position,
            industry: matchedProfile.industry || businessInfo.company_sector || professionalInfo.company_sector,
            avatar_url: matchedProfile.avatar_url || personalInfo.profile_picture,
            linkedin_url: matchedProfile.linkedin_url || personalInfo.linkedin_url || businessInfo.linkedin_url,
            whatsapp_number: matchedProfile.whatsapp_number,
            professional_bio: matchedProfile.professional_bio || businessInfo.professional_bio,
            // Dados extras do onboarding
            phone: personalInfo.phone || businessInfo.phone,
            full_company_name: businessInfo.company_name || professionalInfo.company_name,
            full_position: businessInfo.current_position || professionalInfo.current_position,
            full_industry: businessInfo.company_sector || professionalInfo.company_sector,
            company_size: businessInfo.company_size || professionalInfo.company_size,
            annual_revenue: businessInfo.annual_revenue || professionalInfo.annual_revenue,
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