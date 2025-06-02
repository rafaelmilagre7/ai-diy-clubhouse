
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteDisplayProps {
  upvotes: number;
  downvotes: number;
  showTrend?: boolean;
  compact?: boolean;
  className?: string;
}

const VoteDisplay: React.FC<VoteDisplayProps> = ({
  upvotes,
  downvotes,
  showTrend = false,
  compact = false,
  className
}) => {
  const totalVotes = upvotes + downvotes;
  const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
  const isPositive = upvotes > downvotes;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-600">{upvotes}</span>
        </div>
        
        {!compact && (
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-600">{downvotes}</span>
          </div>
        )}
      </div>

      {showTrend && totalVotes > 5 && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            isPositive ? "border-green-200 text-green-700" : "border-red-200 text-red-700"
          )}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          {Math.round(voteRatio * 100)}%
        </Badge>
      )}
    </div>
  );
};

export default VoteDisplay;
