
import React from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteDisplayProps {
  upvotes: number;
  downvotes: number;
  showTrend?: boolean;
}

const VoteDisplay = ({ upvotes, downvotes, showTrend = true }: VoteDisplayProps) => {
  const total = upvotes + downvotes;
  const approvalRate = total > 0 ? Math.round((upvotes / total) * 100) : 0;
  const isPopular = upvotes > 5 && approvalRate > 70;

  return (
    <div className="flex items-center gap-4">
      {/* Contadores de votos */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-green-600">
          <ThumbsUp className="h-4 w-4" />
          <span className="font-semibold text-sm">{upvotes}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500">
          <ThumbsDown className="h-4 w-4" />
          <span className="font-semibold text-sm">{downvotes}</span>
        </div>
      </div>

      {/* Indicador de tendência */}
      {showTrend && total > 2 && (
        <div className="flex items-center gap-1">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            approvalRate >= 80 ? "bg-green-100 text-green-700" :
            approvalRate >= 60 ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-600"
          )}>
            {approvalRate}% aprovação
          </div>
          
          {isPopular && (
            <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Popular</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoteDisplay;
