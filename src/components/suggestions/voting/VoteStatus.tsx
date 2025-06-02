
import React from 'react';

interface VoteStatusProps {
  userVoteType?: 'upvote' | 'downvote' | null;
  className?: string;
}

const VoteStatus = ({ userVoteType, className = "" }: VoteStatusProps) => {
  if (!userVoteType) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Vote para mostrar seu apoio
      </div>
    );
  }

  return (
    <div className={`text-sm font-medium ${className}`}>
      {userVoteType === 'upvote' ? (
        <span className="text-green-600">✓ Você apoiou esta sugestão</span>
      ) : (
        <span className="text-red-600">✗ Você não apoiou esta sugestão</span>
      )}
    </div>
  );
};

export default VoteStatus;
