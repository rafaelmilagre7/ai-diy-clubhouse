
import React from 'react';
import { UserVote } from '@/types/suggestionTypes';

interface VoteStatusProps {
  userVote?: UserVote | null;
}

const VoteStatus = ({ userVote }: VoteStatusProps) => {
  return (
    <div className="text-sm text-muted-foreground flex-1 ml-2">
      {userVote ? (
        userVote.vote_type === 'upvote' ? (
          <span className="font-medium text-operational">Você apoiou esta sugestão</span>
        ) : (
          <span className="font-medium text-status-error">Você não apoiou esta sugestão</span>
        )
      ) : (
        <span>Vote para mostrar seu apoio</span>
      )}
    </div>
  );
};

export default VoteStatus;
