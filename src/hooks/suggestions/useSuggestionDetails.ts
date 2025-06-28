
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
}

export interface UserVote {
  id: string;
  vote_type: 'upvote' | 'downvote';
}

export type VoteType = 'upvote' | 'downvote';

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  const fetchSuggestion = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      console.log('Simulando busca de sugestão:', id);
      
      // Mock suggestion data
      const mockSuggestion: Suggestion = {
        id: id,
        title: 'Sugestão Exemplo',
        description: 'Esta é uma sugestão de exemplo para demonstração.',
        status: 'new',
        upvotes: 5,
        downvotes: 1,
        created_at: new Date().toISOString()
      };
      
      setSuggestion(mockSuggestion);
    } catch (err: any) {
      console.error('Erro ao buscar sugestão:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType: VoteType) => {
    if (!suggestion) return;
    
    try {
      setVoteLoading(true);
      console.log('Simulando voto:', voteType);
      
      // Simulate vote logic
      setSuggestion(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
            (prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] || 0) + 1
        };
      });
      
      toast.success(`Você ${voteType === 'upvote' ? 'gostou' : 'não gostou'} desta sugestão`);
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
  }, [id]);

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
