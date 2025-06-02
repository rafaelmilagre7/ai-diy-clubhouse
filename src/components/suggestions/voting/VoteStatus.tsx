
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface VoteStatusProps {
  userVoteType?: 'upvote' | 'downvote' | null;
}

export const VoteStatus: React.FC<VoteStatusProps> = ({ userVoteType }) => {
  if (!userVoteType) {
    return (
      <div className="text-sm text-muted-foreground">
        Vote para ajudar a comunidade a identificar as melhores sugestões
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {userVoteType === 'upvote' ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Você achou esta sugestão útil</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Você achou esta sugestão não útil</span>
        </>
      )}
    </div>
  );
};
