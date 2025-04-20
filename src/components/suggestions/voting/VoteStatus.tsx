
import React from 'react';
import { UserVote } from '@/types/suggestionTypes';

interface VoteStatusProps {
  userVote?: UserVote | null;
}

const VoteStatus = ({ userVote }: VoteStatusProps) => {
  return (
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
  );
};

export default VoteStatus;
