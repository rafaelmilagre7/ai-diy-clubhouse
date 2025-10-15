import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
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
  connectionCopy?: string;
  score: number;
  isLoading: boolean;
  matchId?: string;
}

export const useSwipeCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateMatches, isGenerating } = useAIMatches();
  const queryClient = useQueryClient();
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [copyCache, setCopyCache] = useState<Record<string, string>>({});
  const [generatingCopy, setGeneratingCopy] = useState<Set<string>>(new Set());
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
          connection_copy,
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
      return matches || [];
    },
    enabled: !!user?.id,
  });

  // Atualizar cards quando matchesData mudar
  useEffect(() => {
    if (!matchesData) {
      setIsLoadingCards(false);
      return;
    }

    const formattedCards: SwipeCard[] = matchesData.map((match: any) => ({
      userId: match.matched_user.id,
      name: match.matched_user.name || 'Usuário',
      company: match.matched_user.company_name || 'Empresa não informada',
      position: match.matched_user.current_position || 'Cargo não informado',
      avatarUrl: match.matched_user.avatar_url || '',
      linkedinUrl: match.matched_user.linkedin_url,
      whatsappNumber: match.matched_user.whatsapp_number,
      email: match.matched_user.email || '',
      connectionCopy: match.connection_copy,
      score: match.compatibility_score || 0.5,
      isLoading: false,
      matchId: match.id,
    }));

    setCards(formattedCards);
    setCurrentIndex(0); // Resetar para o primeiro card

    // Rastrear IDs já carregados
    const loadedIds = new Set(formattedCards.map(card => card.userId));
    setLoadedUserIds(loadedIds);

    // Cache das copies já existentes
    const cache: Record<string, string> = {};
    formattedCards.forEach(card => {
      if (card.connectionCopy) {
        cache[card.userId] = card.connectionCopy;
      }
    });
    setCopyCache(cache);
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
        connectionCopy: undefined,
        score: 0.3, // Score padrão para perfis não-match
        isLoading: false,
        matchId: undefined,
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

  // Gerar copy para um card específico
  const generateCopy = useCallback(async (targetUserId: string) => {
    if (!user?.id || copyCache[targetUserId] || generatingCopy.has(targetUserId)) return;

    const cardIndex = cards.findIndex(c => c.userId === targetUserId);
    if (cardIndex === -1) return;

    // Marcar como gerando
    setGeneratingCopy(prev => new Set(prev).add(targetUserId));

    // Marcar como loading
    setCards(prev => {
      const updated = [...prev];
      updated[cardIndex] = { ...updated[cardIndex], isLoading: true };
      return updated;
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-connection-copy', {
        body: {
          currentUserId: user.id,
          targetUserId: targetUserId,
        },
      });

      if (error) throw error;

      const generatedCopy = data.copy;

      // Atualizar card com a copy gerada
      setCards(prev => {
        const updated = [...prev];
        updated[cardIndex] = {
          ...updated[cardIndex],
          connectionCopy: generatedCopy,
          isLoading: false,
        };
        return updated;
      });

      // Atualizar cache
      setCopyCache(prev => ({
        ...prev,
        [targetUserId]: generatedCopy,
      }));

      // Limpar estado de geração
      setGeneratingCopy(prev => {
        const updated = new Set(prev);
        updated.delete(targetUserId);
        return updated;
      });

    } catch (error) {
      console.error('Erro ao gerar copy:', error);
      
      // Marcar como não-loading e usar copy padrão
      setCards(prev => {
        const updated = [...prev];
        updated[cardIndex] = {
          ...updated[cardIndex],
          connectionCopy: 'Essa pode ser uma ótima oportunidade de conexão para expandir sua rede profissional.',
          isLoading: false,
        };
        return updated;
      });

      // Limpar estado de geração
      setGeneratingCopy(prev => {
        const updated = new Set(prev);
        updated.delete(targetUserId);
        return updated;
      });

      toast({
        title: 'Não foi possível gerar a descrição personalizada',
        description: 'Mas você ainda pode se conectar!',
        variant: 'default',
      });
    }
  }, [user?.id, cards, copyCache, generatingCopy, toast]);

  // Navegação
  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // Gerar copy para o próximo card se não existir
      const nextCard = cards[nextIndex];
      if (!nextCard.connectionCopy) {
        generateCopy(nextCard.userId);
      }

      // Carregar mais se: (1) não tem 50 matches ainda OU (2) está perto do fim
      if ((cards.length < 50 || nextIndex >= cards.length - 5) && hasMoreProfiles && !isLoadingMore) {
        loadMoreProfiles();
      }
    }
  }, [currentIndex, cards, generateCopy, hasMoreProfiles, isLoadingMore, loadMoreProfiles]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Gerar copy para cards que precisam, com delay entre chamadas
  useEffect(() => {
    const cardsNeedingCopy = cards.filter(c => !c.connectionCopy && !c.isLoading && !generatingCopy.has(c.userId));
    
    if (cardsNeedingCopy.length > 0) {
      // Processar um por vez com delay de 500ms
      cardsNeedingCopy.forEach((card, index) => {
        setTimeout(() => {
          generateCopy(card.userId);
        }, index * 500);
      });
    }
  }, [cards, generateCopy, generatingCopy]);

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