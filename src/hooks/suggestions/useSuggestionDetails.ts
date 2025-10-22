
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Suggestion, UserVote, VoteType } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  const fetchSuggestion = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Buscar sugestão com dados do perfil do usuário usando JOIN
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          profiles!suggestions_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar sugestão:', error);
        setError(new Error(error.message));
        return;
      }
      
      // Mapear dados para incluir user_name e user_avatar do perfil
      const mappedSuggestion = {
        ...data,
        user_name: data.profiles?.name || 'Usuário',
        user_avatar: data.profiles?.avatar_url || null,
        // Remover o objeto profiles aninhado para manter compatibilidade
        profiles: undefined
      };
      
      setSuggestion(mappedSuggestion as Suggestion);
      
      // Buscar o voto do usuário atual, se estiver autenticado
      if (user) {
        const { data: voteData, error: voteError } = await supabase
          .from('suggestion_votes')
          .select('id, vote_type')
          .eq('suggestion_id', id)
          .eq('user_id', user.id)
          .single();
        
        if (!voteError && voteData) {
          setUserVote(voteData as UserVote);
        } else {
          setUserVote(null);
        }
      }
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
      
      // Se o usuário já votou do mesmo tipo, remover o voto
      if (userVote?.vote_type === voteType) {
        const { error } = await supabase
          .from('suggestion_votes')
          .delete()
          .eq('suggestion_id', suggestion.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setUserVote(null);
        
        // Atualizar contagem de votos na sugestão
        setSuggestion(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
              (prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] || 0) - 1
          };
        });
        
        toast.success('Voto removido');
      } else {
        // Se o usuário já votou, mas de outro tipo, atualizar o voto
        if (userVote) {
          const { data, error } = await supabase
            .from('suggestion_votes')
            .update({ vote_type: voteType })
            .eq('suggestion_id', suggestion.id)
            .eq('user_id', user.id)
            .select('id, vote_type')
            .single();
          
          if (error) throw error;
          
          // Atualizar contagem de votos na sugestão (remover voto antigo, adicionar novo)
          setSuggestion(prev => {
            if (!prev) return null;
            return {
              ...prev,
              [userVote.vote_type === 'upvote' ? 'upvotes' : 'downvotes']: 
                (prev[userVote.vote_type === 'upvote' ? 'upvotes' : 'downvotes'] || 0) - 1,
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
                (prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] || 0) + 1
            };
          });
          
          setUserVote(data as UserVote);
        } else {
          // Se o usuário ainda não votou, inserir novo voto
          const { data, error } = await supabase
            .from('suggestion_votes')
            .insert({
              suggestion_id: suggestion.id,
              user_id: user.id,
              vote_type: voteType
            })
            .select('id, vote_type')
            .single();
          
          if (error) throw error;
          
          // Atualizar contagem de votos na sugestão
          setSuggestion(prev => {
            if (!prev) return null;
            return {
              ...prev,
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
                (prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] || 0) + 1
            };
          });
          
          setUserVote(data as UserVote);
        }
        
        toast.success(`Você ${voteType === 'upvote' ? 'gostou' : 'não gostou'} desta sugestão`);
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
    userVote,
    voteLoading,
    handleVote,
    refetch
  };
};
