
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import VoteControls from './voting/VoteControls';
import VoteDisplay from './voting/VoteDisplay';
import VoteStatus from './voting/VoteStatus';

interface SuggestionVotingProps {
  suggestion: {
    id: string;
    upvotes: number;
    downvotes: number;
    user_vote_type?: 'upvote' | 'downvote' | null;
  };
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

const SuggestionVoting = ({
  suggestion,
  voteLoading = false,
  onVote
}: SuggestionVotingProps) => {
  const { user } = useAuth();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error("Você precisa estar logado para votar.");
      return;
    }
    await onVote(voteType);
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <VoteDisplay 
          upvotes={suggestion.upvotes} 
          downvotes={suggestion.downvotes}
          showTrend={true}
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <VoteControls
            userVoteType={suggestion.user_vote_type}
            voteLoading={voteLoading}
            onVote={handleVote}
          />
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <VoteStatus userVoteType={suggestion.user_vote_type} />
      </div>
    </div>
  );
};

export default SuggestionVoting;
