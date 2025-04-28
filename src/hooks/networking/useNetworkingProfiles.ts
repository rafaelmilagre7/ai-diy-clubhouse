
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLogging } from '@/hooks/useLogging';
import { NetworkProfile, CompatibilityResult, NetworkMatch } from '@/types/networkingTypes';

export const useNetworkingProfiles = (compatibilityFilter: string) => {
  const { toast } = useToast();
  const { logError } = useLogging();

  const calculateCompatibility = (currentUser: NetworkProfile, otherUser: NetworkProfile): CompatibilityResult => {
    const currentUserInterests = currentUser.experience_personalization?.interests || [];
    const currentUserSkills = currentUser.experience_personalization?.skills_to_share || [];
    const otherUserInterests = otherUser.experience_personalization?.interests || [];
    const otherUserSkills = otherUser.experience_personalization?.skills_to_share || [];
    
    let score = 0;
    const commonInterests = currentUserInterests.filter(i => otherUserInterests.includes(i));
    const complementarySkills = currentUserInterests.filter(i => otherUserSkills.includes(i));
    
    if (commonInterests.length > 0) score += 0.3 * (commonInterests.length / Math.max(currentUserInterests.length, 1));
    if (complementarySkills.length > 0) score += 0.7 * (complementarySkills.length / Math.max(currentUserInterests.length, 1));
    
    score = Math.min(Math.max(score, 0), 1);
    
    const reason = commonInterests.length > 0 
      ? `Vocês têm ${commonInterests.length} interesses em comum e ${otherUser.profile_name} pode compartilhar conhecimentos em áreas do seu interesse.`
      : `${otherUser.profile_name} tem habilidades que podem complementar seus interesses.`;
    
    const strengths = [
      ...(commonInterests.length > 0 ? [`Interesses em comum: ${commonInterests.slice(0, 3).join(', ')}`] : []),
      ...(complementarySkills.length > 0 ? [`Habilidades complementares: ${complementarySkills.slice(0, 3).join(', ')}`] : []),
    ];
    
    const topics = [
      ...(commonInterests.length > 0 ? commonInterests.slice(0, 2) : []),
      ...(complementarySkills.length > 0 ? complementarySkills.slice(0, 2) : []),
    ];
    
    return { score, reason, strengths, topics };
  };

  return useQuery({
    queryKey: ['network-profiles', compatibilityFilter],
    queryFn: async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          throw new Error('Usuário não autenticado');
        }

        const currentUserId = sessionData.session.user.id;

        const { data, error } = await supabase
          .from('onboarding_profile_view')
          .select('*')
          .neq('user_id', currentUserId);

        if (error) throw error;

        const { data: currentUser, error: currentUserError } = await supabase
          .from('onboarding_profile_view')
          .select('*')
          .eq('user_id', currentUserId)
          .single();

        if (currentUserError) {
          throw new Error('Não foi possível carregar seus dados de perfil');
        }

        const profilesWithCompatibility = data.map((profile: NetworkProfile) => {
          const compatibility = calculateCompatibility(currentUser, profile);
          return {
            id: profile.user_id,
            matched_user_id: profile.user_id,
            matched_user_name: profile.profile_name || 'Membro',
            matched_user_avatar: profile.profile_avatar || '',
            matched_user_company: profile.profile_company || 'Empresa não informada',
            matched_user_position: profile.professional_info?.current_position || 'Cargo não informado',
            matched_user_email: profile.personal_info?.email || '',
            matched_user_phone: profile.personal_info?.phone,
            compatibility_score: compatibility.score,
            match_reason: compatibility.reason,
            match_strengths: compatibility.strengths,
            suggested_topics: compatibility.topics,
            status: 'pending'
          } as NetworkMatch;
        });

        let filteredProfiles = profilesWithCompatibility;
        if (compatibilityFilter === 'high') {
          filteredProfiles = profilesWithCompatibility.filter(p => p.compatibility_score >= 0.7);
        } else if (compatibilityFilter === 'medium') {
          filteredProfiles = profilesWithCompatibility.filter(p => p.compatibility_score >= 0.4 && p.compatibility_score < 0.7);
        }

        return filteredProfiles.sort((a, b) => b.compatibility_score - a.compatibility_score);
      } catch (error) {
        logError('fetch-profiles', error);
        toast({
          title: 'Erro ao carregar perfis',
          description: 'Não foi possível carregar os perfis dos membros. Tente novamente mais tarde.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};
