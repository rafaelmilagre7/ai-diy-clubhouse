
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface SuggestionVotingProps {
  suggestion: {
    id: string;
    upvotes: number;
    downvotes: number;
  };
  userVote?: { id: string; vote_type: 'upvote' | 'downvote' } | null;
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

const SuggestionVoting = ({
  suggestion,
  userVote,
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
    <div className="flex items-center gap-4 border p-3 rounded-lg">
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${
            userVote?.vote_type === 'upvote' ? 'bg-green-50 text-green-600 border-green-200' : ''
          }`}
          disabled={voteLoading}
          onClick={() => handleVote('upvote')}
        >
          <ThumbsUp size={16} />
          <span>{suggestion.upvotes || 0}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${
            userVote?.vote_type === 'downvote' ? 'bg-red-50 text-red-600 border-red-200' : ''
          }`}
          disabled={voteLoading}
          onClick={() => handleVote('downvote')}
        >
          <ThumbsDown size={16} />
          <span>{suggestion.downvotes || 0}</span>
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground flex-1">
        {userVote ? (
          userVote.vote_type === 'upvote' ? (
            <span>Você gostou desta sugestão</span>
          ) : (
            <span>Você não gostou desta sugestão</span>
          )
        ) : (
          <span>Vote para mostrar seu apoio</span>
        )}
      </div>
    </div>
  );
};

export default SuggestionVoting;
