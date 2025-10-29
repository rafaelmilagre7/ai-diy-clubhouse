import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useAIMatches } from '@/hooks/useAIMatches';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface SwipeCard {
  userId: string;
  name: string;
  company: string;
  position: string;
  avatarUrl: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
  email: string;
  score: number;
  matchId?: string;
  enrichedData?: {
    value_proposition?: string;
    looking_for?: string[];
    main_challenge?: string;
    keywords?: string[];
    ai_experience?: any;
    goals_info?: any;
    professional_info?: any;
  };
}

export const useSwipeCards = () => {
  const { user } = useAuth();
  const { generateMatches, isGenerating } = useAIMatches();
  const queryClient = useQueryClient();
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [loadedUserIds, setLoadedUserIds] = useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const isLoadingMoreRef = useRef(false);

  // Usar useQuery para buscar matches automaticamente
  const { data: matchesData, refetch: refetchMatches } = useQuery({
    queryKey: ['network-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: matches, error } = await supabase
        .from('strategic_matches_v2')
        .select(`
          id,
          matched_user_id,
          compatibility_score,
          matched_user:profiles!strategic_matches_v2_matched_user_id_fkey(
            id,
            name,
            email,
            avatar_url,
            company_name,
            current_position,
            linkedin_url,
            whatsapp_number
          )
        `)
        .eq('user_id', user.id)
        .order('compatibility_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar dados enriquecidos para cada match
      const enrichedMatches = await Promise.all((matches || []).map(async (match) => {
        const matchedUserId = match.matched_user_id;

        // Buscar dados de networking_profiles_v2
        const { data: networkingProfile } = await supabase
          .from('networking_profiles_v2')
          .select('value_proposition, looking_for, main_challenge, keywords')
          .eq('user_id', matchedUserId)
          .maybeSingle();

        // Buscar dados de onboarding_final
        const { data: onboardingData } = await supabase
          .from('onboarding_final')
          .select('ai_experience, goals_info, professional_info')
          .eq('user_id', matchedUserId)
          .maybeSingle();

        return {
          ...match,
          enrichedData: {
            value_proposition: networkingProfile?.value_proposition,
            looking_for: networkingProfile?.looking_for,
            main_challenge: networkingProfile?.main_challenge,
            keywords: networkingProfile?.keywords,
            ai_experience: onboardingData?.ai_experience,
            goals_info: onboardingData?.goals_info,
            professional_info: onboardingData?.professional_info
          }
        };
      }));

      return enrichedMatches;
    },
    enabled: !!user?.id,
  });

  // Atualizar cards quando matchesData mudar
  useEffect(() => {
    if (!matchesData) {
      setIsLoadingCards(false);
      return;
    }

    const formattedCards: SwipeCard[] = matchesData
      .filter((match: any) => match.matched_user && match.matched_user.id)
      .map((match: any) => ({
        userId: match.matched_user.id,
        name: match.matched_user.name || 'Usuário',
        company: match.matched_user.company_name || 'Empresa não informada',
        position: match.matched_user.current_position || 'Cargo não informado',
        avatarUrl: match.matched_user.avatar_url || '',
        linkedinUrl: match.matched_user.linkedin_url,
        whatsappNumber: match.matched_user.whatsapp_number,
        email: match.matched_user.email || '',
        score: match.compatibility_score || 50, // JÁ É INTEGER 0-100
        matchId: match.id,
        enrichedData: match.enrichedData || {}, // Dados enriquecidos
      }));

    setCards(formattedCards);
    setCurrentIndex(0);

    // Rastrear IDs já carregados
    const loadedIds = new Set(formattedCards.map(card => card.userId));
    setLoadedUserIds(loadedIds);
    setIsLoadingCards(false);
  }, [matchesData]);

  // Buscar matches iniciais (removido, agora feito via useQuery)
  const loadMatches = useCallback(async () => {
    refetchMatches();
  }, [refetchMatches]);

  // Carregar mais perfis (não-matches)
  const loadMoreProfiles = useCallback(async () => {
    if (!user?.id || isLoadingMoreRef.current || !hasMoreProfiles) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const { data: profiles, error } = await supabase
        .from('networking_profiles_v2')
        .select(`
          user_id,
          name,
          company_name,
          current_position,
          avatar_url,
          linkedin_url,
          whatsapp_number,
          email
        `)
        .neq('user_id', user.id)
        .not('user_id', 'in', `(${Array.from(loadedUserIds).join(',')})`)
        .not('profile_completed_at', 'is', null)
        .order('profile_completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!profiles || profiles.length === 0) {
        setHasMoreProfiles(false);
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
        return;
      }

      const newCards: SwipeCard[] = profiles.map((profile: any) => ({
        userId: profile.user_id,
        name: profile.name || 'Usuário',
        company: profile.company_name || 'Empresa não informada',
        position: profile.current_position || 'Cargo não informado',
        avatarUrl: profile.avatar_url || '',
        linkedinUrl: profile.linkedin_url,
        whatsappNumber: profile.whatsapp_number,
        email: profile.email || '',
        score: 30, // INTEGER 0-100
        matchId: undefined,
        enrichedData: {},
      }));

      setCards(prev => [...prev, ...newCards]);
      setLoadedUserIds(prev => {
        const updated = new Set(prev);
        newCards.forEach(card => updated.add(card.userId));
        return updated;
      });

      if (profiles.length < 20) {
        setHasMoreProfiles(false);
      }

    } catch (error) {
      console.error('Erro ao carregar mais perfis:', error);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [user?.id, loadedUserIds, hasMoreProfiles]);

  // Navegação
  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Carregar mais se: (1) não tem 50 matches ainda OU (2) está perto do fim
      if ((cards.length < 50 || nextIndex >= cards.length - 5) && hasMoreProfiles && !isLoadingMore) {
        loadMoreProfiles();
      }
    }
  }, [currentIndex, cards, hasMoreProfiles, isLoadingMore, loadMoreProfiles]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const currentCard = cards[currentIndex] || null;
  const hasNext = currentIndex < cards.length - 1;
  const hasPrevious = currentIndex > 0;

  return {
    currentCard,
    nextCard,
    previousCard,
    hasNext,
    hasPrevious,
    isLoadingCards,
    totalCards: cards.length,
    currentIndex,
    refetch: loadMatches,
    generateMatches: () => generateMatches(user?.id || ''),
    isGenerating,
  };
};