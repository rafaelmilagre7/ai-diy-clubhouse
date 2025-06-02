
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

    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        profiles:user_id(name, avatar_url),
        user_vote:suggestion_votes!inner(vote_type)
      `)
      .eq('id', id)
      .eq('suggestion_votes.user_id', user?.id || '')
      .single();

    if (error) throw error;
    
    return {
      ...data,
      user_name: data.profiles?.name,
      user_avatar: data.profiles?.avatar_url,
      user_vote_type: data.user_vote?.[0]?.vote_type || null
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
