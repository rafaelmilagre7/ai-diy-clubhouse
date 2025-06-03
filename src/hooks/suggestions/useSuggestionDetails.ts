
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useVoting } from './useVoting';

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { voteLoading, voteMutation } = useVoting();

  const fetchSuggestionDetails = async () => {
    if (!id) {
      throw new Error('ID da sugestão não fornecido');
    }

    console.log('Buscando detalhes da sugestão:', id);

    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar detalhes da sugestão:', error);
      throw new Error(`Erro ao buscar sugestão: ${error.message}`);
    }

    if (!data) {
      throw new Error('Sugestão não encontrada');
    }

    console.log('Detalhes da sugestão carregados:', data);
    return data;
  };

  const fetchUserVote = async () => {
    if (!user || !id) {
      return null;
    }

    console.log('Buscando voto do usuário para sugestão:', id);

    const { data, error } = await supabase
      .from('suggestion_votes')
      .select('*')
      .eq('suggestion_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar voto do usuário:', error);
      return null;
    }

    return data;
  };

  const {
    data: suggestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestion-details', id],
    queryFn: fetchSuggestionDetails,
    enabled: !!id,
    staleTime: 1000 * 30, // 30 segundos
    retry: 2
  });

  const {
    data: userVote,
    isLoading: userVoteLoading
  } = useQuery({
    queryKey: ['user-vote', id, user?.id],
    queryFn: fetchUserVote,
    enabled: !!id && !!user,
    staleTime: 1000 * 60, // 1 minuto
    retry: 1
  });

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!id) return;
    
    await voteMutation.mutateAsync({
      suggestionId: id,
      voteType
    });
    
    // Recarregar dados após votação
    refetch();
  };

  return {
    suggestion,
    isLoading: isLoading || userVoteLoading,
    error,
    refetch,
    userVote,
    voteLoading,
    handleVote
  };
};
