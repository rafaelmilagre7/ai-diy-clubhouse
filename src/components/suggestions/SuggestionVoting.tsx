
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { UserVote } from '@/types/suggestionTypes';

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
  suggestion,
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
          <span>Apoiar</span>
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
          <span>Não apoiar</span>
        </Button>

        <div className="ml-3 px-3 py-1 rounded-full bg-gray-100">
          <span className={`text-lg font-semibold ${voteBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {voteBalance > 0 ? `+${voteBalance}` : voteBalance}
          </span>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground flex-1">
        {userVote ? (
          userVote.vote_type === 'upvote' ? (
            <span>Você apoiou esta sugestão</span>
          ) : (
            <span>Você não apoiou esta sugestão</span>
          )
        ) : (
          <span>Vote para mostrar seu apoio</span>
        )}
      </div>
    </div>
  );
};

export default SuggestionVoting;
