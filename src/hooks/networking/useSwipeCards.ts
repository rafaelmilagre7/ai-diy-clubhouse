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
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalToGenerate, setTotalToGenerate] = useState(0);
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

  // Gerar copy para um card específico com fallback gracioso
  const generateCopy = useCallback(async (targetUserId: string) => {
    if (!user?.id || copyCache[targetUserId] || generatingCopy.has(targetUserId)) return;

    const cardIndex = cards.findIndex(c => c && c.userId === targetUserId);
    if (cardIndex === -1) return;

    const card = cards[cardIndex];
    if (!card || !card.userId) return;

    const cardName = cards[cardIndex]?.name || 'este profissional';
    const fallbackCopy = `Conecte-se com ${cardName} para explorar oportunidades estratégicas de parceria e crescimento.`;

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

      const generatedCopy = data?.copy || fallbackCopy;

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
      console.warn('⚠️ Falha ao gerar copy com IA, usando fallback:', error);
      
      // Usar copy genérica e NÃO mostrar toast (silencioso)
      setCards(prev => {
        const updated = [...prev];
        updated[cardIndex] = {
          ...updated[cardIndex],
          connectionCopy: fallbackCopy,
          isLoading: false,
        };
        return updated;
      });

      // Atualizar cache com fallback
      setCopyCache(prev => ({
        ...prev,
        [targetUserId]: fallbackCopy,
      }));

      // Limpar estado de geração
      setGeneratingCopy(prev => {
        const updated = new Set(prev);
        updated.delete(targetUserId);
        return updated;
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

  // Progressive Loading com Rate Limiter: Gerar copy em lotes com delay
  useEffect(() => {
    const cardsNeedingCopy = cards.filter(c => 
      c && 
      c.userId && 
      !c.connectionCopy && 
      !c.isLoading && 
      !generatingCopy.has(c.userId)
    );
    
    if (cardsNeedingCopy.length > 0) {
      setTotalToGenerate(cardsNeedingCopy.length);
      
      // 🚦 RATE LIMITER: Processar 3 cards por vez com delay de 2s entre lotes
      const batchSize = 3;
      const batchDelay = 2000;
      
      const processBatches = async () => {
        for (let i = 0; i < cardsNeedingCopy.length; i += batchSize) {
          const batch = cardsNeedingCopy.slice(i, i + batchSize);
          setGeneratedCount(Math.min(i + batchSize, cardsNeedingCopy.length));
          
          // Processar lote em paralelo
          await Promise.all(batch.map(card => generateCopy(card.userId)));
          
          // Delay entre lotes (exceto no último)
          if (i + batchSize < cardsNeedingCopy.length) {
            await new Promise(resolve => setTimeout(resolve, batchDelay));
          }
        }
        
        // Reset após finalizar
        setGeneratedCount(0);
        setTotalToGenerate(0);
      };
      
      processBatches();
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
    generatedCount,
    totalToGenerate,
  };
};