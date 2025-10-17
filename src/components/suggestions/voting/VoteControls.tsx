
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { UserVote } from '@/types/suggestionTypes';

interface VoteControlsProps {
  userVote?: UserVote | null;
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

const VoteControls = ({ userVote, voteLoading = false, onVote }: VoteControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 ${
          userVote?.vote_type === 'upvote' ? 'bg-operational/10 text-operational border-operational/30 hover:bg-operational/20' : ''
        }`}
        disabled={voteLoading}
        onClick={() => onVote('upvote')}
        aria-label="Apoiar"
      >
        <ThumbsUp size={16} />
        <span>Apoiar</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 ${
          userVote?.vote_type === 'downvote' ? 'bg-status-error/10 text-status-error border-status-error/30 hover:bg-status-error/20' : ''
        }`}
        disabled={voteLoading}
        onClick={() => onVote('downvote')}
        aria-label="Não apoiar"
      >
        <ThumbsDown size={16} />
        <span>Não apoiar</span>
      </Button>
    </div>
  );
};

export default VoteControls;
