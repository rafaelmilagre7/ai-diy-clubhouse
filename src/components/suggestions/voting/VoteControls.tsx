
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
          userVote?.vote_type === 'upvote' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : ''
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
          userVote?.vote_type === 'downvote' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : ''
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
