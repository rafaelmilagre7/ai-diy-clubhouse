
import React from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';

interface VoteDisplayProps {
  upvotes: number;
  downvotes: number;
  showTrend?: boolean;
}

export const VoteDisplay: React.FC<VoteDisplayProps> = ({ 
  upvotes, 
  downvotes, 
  showTrend = false 
}) => {
  const totalVotes = upvotes + downvotes;
  const ratio = totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-green-600">
          <ThumbsUp className="h-4 w-4" />
          <span className="font-medium">{upvotes}</span>
        </div>
        
        <div className="flex items-center gap-1 text-red-600">
          <ThumbsDown className="h-4 w-4" />
          <span className="font-medium">{downvotes}</span>
        </div>
      </div>

      {showTrend && totalVotes > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span className="text-sm">{Math.round(ratio)}% positivos</span>
        </div>
      )}
    </div>
  );
};
