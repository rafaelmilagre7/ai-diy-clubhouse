
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface SuggestionVotingProps {
  suggestion: {
    id: string;
    upvotes: number;
    downvotes: number;
  };
  userVote?: { vote_type: 'upvote' | 'downvote' };
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  voteLoading?: boolean;
}

const SuggestionVoting = ({ suggestion, userVote, onVote, voteLoading = false }: SuggestionVotingProps) => {
  const { user } = useAuth();
  const hasVoted = userVote !== undefined;
  
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant={userVote?.vote_type === 'upvote' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onVote('upvote')}
        disabled={voteLoading || !user}
        title={!user ? "Faça login para votar" : "Votar positivamente"}
      >
        <ThumbsUp size={16} className="mr-1" />
        {suggestion.upvotes || 0}
      </Button>
      <Button 
        variant={userVote?.vote_type === 'downvote' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onVote('downvote')}
        disabled={voteLoading || !user}
        title={!user ? "Faça login para votar" : "Votar negativamente"}
      >
        <ThumbsDown size={16} className="mr-1" />
        {suggestion.downvotes || 0}
      </Button>
    </div>
  );
};

export default SuggestionVoting;
