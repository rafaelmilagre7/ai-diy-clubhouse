
import React from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VoteDisplayProps {
  upvotes: number;
  downvotes: number;
  showTrend?: boolean;
}

const VoteDisplay: React.FC<VoteDisplayProps> = ({ 
  upvotes, 
  downvotes, 
  showTrend = false 
}) => {
  const total = upvotes + downvotes;
  const approvalRate = total > 0 ? Math.round((upvotes / total) * 100) : 0;
  const isPositive = upvotes > downvotes;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-green-600">
          <ThumbsUp className="h-4 w-4" />
          <span className="font-semibold">{upvotes}</span>
        </div>
        
        <div className="flex items-center gap-1 text-red-500">
          <ThumbsDown className="h-4 w-4" />
          <span className="font-semibold">{downvotes}</span>
        </div>
      </div>

      {showTrend && total > 2 && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              isPositive 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-red-100 text-red-800 border-red-200'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {approvalRate}% aprovação
          </Badge>
        </div>
      )}
    </div>
  );
};

export default VoteDisplay;
