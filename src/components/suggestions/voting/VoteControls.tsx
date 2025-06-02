
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteControlsProps {
  userVoteType?: 'upvote' | 'downvote' | null;
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

const VoteControls = ({ userVoteType, voteLoading = false, onVote }: VoteControlsProps) => {
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (voteLoading) return;
    await onVote(voteType);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]",
          userVoteType === 'upvote' 
            ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' 
            : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'
        )}
        disabled={voteLoading}
        onClick={() => handleVote('upvote')}
        aria-label="Apoiar sugestão"
      >
        <ThumbsUp 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            userVoteType === 'upvote' ? "scale-110" : ""
          )} 
        />
        <span className="font-medium">Apoiar</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]",
          userVoteType === 'downvote' 
            ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' 
            : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'
        )}
        disabled={voteLoading}
        onClick={() => handleVote('downvote')}
        aria-label="Não apoiar sugestão"
      >
        <ThumbsDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            userVoteType === 'downvote' ? "scale-110" : ""
          )} 
        />
        <span className="font-medium">Não apoiar</span>
      </Button>
    </div>
  );
};

export default VoteControls;
