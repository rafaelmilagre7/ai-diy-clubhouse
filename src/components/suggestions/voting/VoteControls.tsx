
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface VoteControlsProps {
  userVoteType?: 'upvote' | 'downvote' | null;
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => void;
}

export const VoteControls: React.FC<VoteControlsProps> = ({
  userVoteType,
  voteLoading = false,
  onVote
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVoteType === 'upvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onVote('upvote')}
        disabled={voteLoading}
        className="gap-1"
      >
        <ThumbsUp className="h-3 w-3" />
        {userVoteType === 'upvote' ? 'Votado' : 'Votar'}
      </Button>

      <Button
        variant={userVoteType === 'downvote' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => onVote('downvote')}
        disabled={voteLoading}
        className="gap-1"
      >
        <ThumbsDown className="h-3 w-3" />
        {userVoteType === 'downvote' ? 'Votado' : 'Contra'}
      </Button>
    </div>
  );
};
