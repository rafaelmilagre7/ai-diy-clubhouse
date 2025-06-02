
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface VoteStatusProps {
  userVoteType: 'upvote' | 'downvote' | null | undefined;
}

const VoteStatus: React.FC<VoteStatusProps> = ({ userVoteType }) => {
  if (!userVoteType) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Você ainda não votou nesta sugestão</span>
      </div>
    );
  }

  if (userVoteType === 'upvote') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
        <CheckCircle className="h-4 w-4" />
        <span>Você apoiou esta sugestão</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
      <XCircle className="h-4 w-4" />
      <span>Você não apoiou esta sugestão</span>
    </div>
  );
};

export default VoteStatus;
