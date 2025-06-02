
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useVoting } from './useVoting';

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { voteLoading, voteMutation } = useVoting();

  const fetchSuggestion = async () => {
    if (!id) throw new Error('ID da sugestão não fornecido');

    // Buscar a sugestão com dados do autor
    const { data: suggestion, error: suggestionError } = await supabase
      .from('suggestions')
      .select(`
        *,
        profiles:user_id(name, avatar_url),
        suggestion_categories:category_id(name, color)
      `)
      .eq('id', id)
      .single();

    if (suggestionError) throw suggestionError;

    // Buscar voto do usuário atual se estiver logado
    let userVote = null;
    if (user) {
      const { data: voteData } = await supabase
        .from('suggestion_votes')
        .select('vote_type')
        .eq('suggestion_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      userVote = voteData?.vote_type || null;
    }
    
    return {
      ...suggestion,
      user_name: suggestion.profiles?.name,
      user_avatar: suggestion.profiles?.avatar_url,
      user_vote_type: userVote,
      category_name: suggestion.suggestion_categories?.name,
      category_color: suggestion.suggestion_categories?.color
    };
  };

  const {
    data: suggestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestion', id, user?.id],
    queryFn: fetchSuggestion,
    enabled: !!id
  });

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!id) return;
    await voteMutation.mutateAsync({ suggestionId: id, voteType });
    // Refetch para atualizar os dados após votar
    refetch();
  };

  return {
    suggestion,
    isLoading,
    error,
    voteLoading,
    handleVote,
    refetch
  };
};
