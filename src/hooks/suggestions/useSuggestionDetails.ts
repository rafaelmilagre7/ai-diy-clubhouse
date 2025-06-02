
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Suggestion, VoteType } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  const fetchSuggestion = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      console.log('Buscando detalhes da sugestão:', id);
      
      const { data, error } = await supabase
        .from('suggestions_with_votes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar sugestão:', error);
        setError(new Error(error.message));
        return;
      }
      
      setSuggestion(data as Suggestion);
    } catch (err: any) {
      console.error('Erro inesperado ao buscar sugestão:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType: VoteType) => {
    if (!user || !suggestion) {
      toast.error('Você precisa estar logado para votar');
      return;
    }
    
    try {
      setVoteLoading(true);
      
      const currentVoteType = suggestion.user_vote_type;
      
      // Se o usuário já votou do mesmo tipo, remover o voto
      if (currentVoteType === voteType) {
        const { error } = await supabase
          .from('suggestion_votes')
          .delete()
          .eq('suggestion_id', suggestion.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Atualizar estado local
        setSuggestion(prev => {
          if (!prev) return null;
          return {
            ...prev,
            user_vote_type: null,
            user_vote_id: undefined,
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
              Math.max(0, (prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] || 0) - 1)
          };
        });
        
        toast.success('Voto removido');
      } else {
        // Upsert do voto
        const { error } = await supabase
          .from('suggestion_votes')
          .upsert({
            suggestion_id: suggestion.id,
            user_id: user.id,
            vote_type: voteType
          });
        
        if (error) throw error;
        
        // Atualizar estado local
        setSuggestion(prev => {
          if (!prev) return null;
          
          let newSuggestion = { ...prev };
          
          // Se mudou o tipo de voto, decrementar o anterior
          if (currentVoteType) {
            const oldKey = currentVoteType === 'upvote' ? 'upvotes' : 'downvotes';
            newSuggestion[oldKey] = Math.max(0, (prev[oldKey] || 0) - 1);
          }
          
          // Incrementar o novo voto
          const newKey = voteType === 'upvote' ? 'upvotes' : 'downvotes';
          newSuggestion[newKey] = (prev[newKey] || 0) + 1;
          newSuggestion.user_vote_type = voteType;
          
          return newSuggestion;
        });
        
        toast.success(`Você ${voteType === 'upvote' ? 'apoiou' : 'não apoiou'} esta sugestão`);
      }
    } catch (err: any) {
      console.error('Erro ao votar:', err);
      toast.error('Erro ao registrar seu voto');
    } finally {
      setVoteLoading(false);
    }
  };

  const refetch = fetchSuggestion;

  useEffect(() => {
    fetchSuggestion();
  }, [id, user]);

  return {
    suggestion,
    isLoading,
    error,
    voteLoading,
    handleVote,
    refetch
  };
};
