
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteControlsProps {
  userVoteType: 'upvote' | 'downvote' | null | undefined;
  voteLoading: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

const VoteControls: React.FC<VoteControlsProps> = ({
  userVoteType,
  voteLoading,
  onVote
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={userVoteType === 'upvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onVote('upvote')}
        disabled={voteLoading}
        className={cn(
          "gap-2 transition-all duration-200",
          userVoteType === 'upvote' 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
        )}
      >
        {voteLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className="h-4 w-4" />
        )}
        Apoiar
      </Button>
      
      <Button
        variant={userVoteType === 'downvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onVote('downvote')}
        disabled={voteLoading}
        className={cn(
          "gap-2 transition-all duration-200",
          userVoteType === 'downvote' 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        )}
      >
        {voteLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsDown className="h-4 w-4" />
        )}
        Não apoiar
      </Button>
    </div>
  );
};

export default VoteControls;
