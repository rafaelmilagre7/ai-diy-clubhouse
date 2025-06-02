
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface VoteStatusProps {
  userVoteType: 'upvote' | 'downvote' | null | undefined;
}

const VoteStatus: React.FC<VoteStatusProps> = ({ userVoteType }) => {
  if (!userVoteType) {
    return (
      <p className="text-sm text-muted-foreground">
        Clique em apoiar ou não apoiar para registrar seu voto
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {userVoteType === 'upvote' ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Você apoiou esta sugestão
          </Badge>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-600" />
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Você não apoiou esta sugestão
          </Badge>
        </>
      )}
    </div>
  );
};

export default VoteStatus;
