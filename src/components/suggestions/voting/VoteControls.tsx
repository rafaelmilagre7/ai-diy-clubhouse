
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface VoteControlsProps {
  userVoteType?: 'upvote' | 'downvote' | null;
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

export const VoteControls: React.FC<VoteControlsProps> = ({
  userVoteType,
  voteLoading = false,
  onVote
}) => {
  const { user } = useAuth();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error("Você precisa estar logado para votar.");
      return;
    }
    await onVote(voteType);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVoteType === 'upvote' ? 'default' : 'outline'}
        size="sm"
        className="gap-2"
        onClick={() => handleVote('upvote')}
        disabled={voteLoading}
      >
        <ThumbsUp className="h-4 w-4" />
        Útil
      </Button>

      <Button
        variant={userVoteType === 'downvote' ? 'destructive' : 'outline'}
        size="sm"
        className="gap-2"
        onClick={() => handleVote('downvote')}
        disabled={voteLoading}
      >
        <ThumbsDown className="h-4 w-4" />
        Não útil
      </Button>
    </div>
  );
};
