
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { UserVote } from '@/types/suggestionTypes';
import VoteControls from './voting/VoteControls';
import VoteDisplay from './voting/VoteDisplay';
import VoteStatus from './voting/VoteStatus';

interface SuggestionVotingProps {
  suggestion: {
    id: string;
    upvotes: number;
    downvotes: number;
  };
  userVote?: UserVote | null;
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  voteBalance: number;
}

const SuggestionVoting = ({
  userVote,
  voteLoading = false,
  onVote,
  voteBalance
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
    <div className="flex items-center gap-4 border p-3 rounded-lg">
      <div className="flex gap-2 items-center">
        <VoteControls
          userVote={userVote}
          voteLoading={voteLoading}
          onVote={handleVote}
        />
        <VoteDisplay voteBalance={voteBalance} />
      </div>
      <VoteStatus userVote={userVote} />
    </div>
  );
};

export default SuggestionVoting;
