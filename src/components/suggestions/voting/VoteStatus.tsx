
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface VoteStatusProps {
  userVoteType?: 'upvote' | 'downvote' | null;
}

export const VoteStatus: React.FC<VoteStatusProps> = ({ userVoteType }) => {
  if (!userVoteType) {
    return (
      <p className="text-sm text-muted-foreground">
        Você ainda não votou nesta sugestão.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {userVoteType === 'upvote' ? (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Você votou a favor
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Você votou contra
        </Badge>
      )}
    </div>
  );
};
