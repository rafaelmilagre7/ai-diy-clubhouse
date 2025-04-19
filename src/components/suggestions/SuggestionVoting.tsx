
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface SuggestionVotingProps {
  suggestion: {
    upvotes: number;
    downvotes: number;
  };
  userVote?: { vote_type: 'upvote' | 'downvote' };
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => void;
}

const SuggestionVoting = ({ suggestion, userVote, voteLoading, onVote }: SuggestionVotingProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant={userVote?.vote_type === 'upvote' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onVote('upvote')}
        disabled={voteLoading}
      >
        <ThumbsUp size={16} className="mr-1" />
        {suggestion.upvotes || 0}
      </Button>
      <Button 
        variant={userVote?.vote_type === 'downvote' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onVote('downvote')}
        disabled={voteLoading}
      >
        <ThumbsDown size={16} className="mr-1" />
        {suggestion.downvotes || 0}
      </Button>
    </div>
  );
};

export default SuggestionVoting;
