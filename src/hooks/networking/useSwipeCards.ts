import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

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
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [copyCache, setCopyCache] = useState<Record<string, string>>({});

  // Buscar matches iniciais
  const loadMatches = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingCards(true);
    try {
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
        .limit(20);

      if (error) throw error;

      const formattedCards: SwipeCard[] = (matches || []).map((match: any) => ({
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
        isLoading: !match.connection_copy,
        matchId: match.id,
      }));

      setCards(formattedCards);

      // Cache das copies já existentes
      const cache: Record<string, string> = {};
      formattedCards.forEach(card => {
        if (card.connectionCopy) {
          cache[card.userId] = card.connectionCopy;
        }
      });
      setCopyCache(cache);

    } catch (error) {
      console.error('Erro ao carregar matches:', error);
      toast({
        title: 'Erro ao carregar conexões',
        description: 'Não foi possível buscar suas conexões sugeridas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCards(false);
    }
  }, [user?.id, toast]);

  // Gerar copy para um card específico
  const generateCopy = useCallback(async (targetUserId: string) => {
    if (!user?.id || copyCache[targetUserId]) return;

    const cardIndex = cards.findIndex(c => c.userId === targetUserId);
    if (cardIndex === -1) return;

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

      toast({
        title: 'Não foi possível gerar a descrição personalizada',
        description: 'Mas você ainda pode se conectar!',
        variant: 'default',
      });
    }
  }, [user?.id, cards, copyCache, toast]);

  // Navegação
  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // Gerar copy para o próximo card se não existir
      const nextCard = cards[nextIndex];
      if (!nextCard.connectionCopy && !nextCard.isLoading) {
        generateCopy(nextCard.userId);
      }
    }
  }, [currentIndex, cards, generateCopy]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Carregar matches ao montar
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Gerar copy para o card atual se não existir
  useEffect(() => {
    if (cards.length > 0 && currentIndex < cards.length) {
      const currentCard = cards[currentIndex];
      if (!currentCard.connectionCopy && !currentCard.isLoading) {
        generateCopy(currentCard.userId);
      }
    }
  }, [cards, currentIndex, generateCopy]);

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
  };
};