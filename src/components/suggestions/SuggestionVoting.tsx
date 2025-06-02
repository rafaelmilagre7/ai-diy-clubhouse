
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VoteControls } from './voting/VoteControls';
import { VoteDisplay } from './voting/VoteDisplay';
import { VoteStatus } from './voting/VoteStatus';

interface SuggestionVotingProps {
  suggestion: {
    id: string;
    upvotes: number;
    downvotes: number;
    user_vote_type?: 'upvote' | 'downvote' | null;
  };
  voteLoading?: boolean;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
}

const SuggestionVoting: React.FC<SuggestionVotingProps> = ({
  suggestion,
  voteLoading = false,
  onVote
}) => {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Título */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              O que você achou desta sugestão?
            </h3>
            <p className="text-sm text-muted-foreground">
              Seu voto ajuda a comunidade a identificar as melhores ideias
            </p>
          </div>

          {/* Display dos votos */}
          <div className="flex justify-center">
            <VoteDisplay 
              upvotes={suggestion.upvotes}
              downvotes={suggestion.downvotes}
              showTrend={true}
            />
          </div>

          {/* Controles de votação */}
          <div className="flex justify-center">
            <VoteControls
              userVoteType={suggestion.user_vote_type}
              voteLoading={voteLoading}
              onVote={onVote}
            />
          </div>

          {/* Status do voto */}
          <div className="text-center">
            <VoteStatus userVoteType={suggestion.user_vote_type} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionVoting;
