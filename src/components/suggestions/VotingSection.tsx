
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useVoting } from '@/hooks/suggestions/useVoting';
import { toast } from 'sonner';

interface VotingSectionProps {
  suggestionId: string;
  upvotes: number;
  downvotes: number;
  userVote?: { vote_type: 'upvote' | 'downvote' } | null;
  onVoteSuccess?: () => void;
}

export const VotingSection = ({ 
  suggestionId, 
  upvotes, 
  downvotes, 
  userVote,
  onVoteSuccess 
}: VotingSectionProps) => {
  const { user } = useAuth();
  const { voteLoading, voteMutation } = useVoting();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Você precisa estar logado para votar');
      return;
    }

    try {
      await voteMutation.mutateAsync({
        suggestionId,
        voteType
      });
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const voteBalance = upvotes - downvotes;

  return (
    <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border border-white/10">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${
            userVote?.vote_type === 'upvote' 
              ? 'bg-green-500/20 border-green-500 text-green-400' 
              : 'border-white/20 text-white hover:bg-green-500/10'
          }`}
          disabled={voteLoading}
          onClick={() => handleVote('upvote')}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>Apoiar ({upvotes})</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${
            userVote?.vote_type === 'downvote' 
              ? 'bg-red-500/20 border-red-500 text-red-400' 
              : 'border-white/20 text-white hover:bg-red-500/10'
          }`}
          disabled={voteLoading}
          onClick={() => handleVote('downvote')}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>Não Apoiar ({downvotes})</span>
        </Button>
      </div>
      
      <div className="flex-1 text-right">
        <span className={`font-medium ${
          voteBalance > 0 ? 'text-green-400' : 
          voteBalance < 0 ? 'text-red-400' : 
          'text-gray-400'
        }`}>
          Saldo: {voteBalance > 0 ? `+${voteBalance}` : voteBalance}
        </span>
      </div>
    </div>
  );
};
