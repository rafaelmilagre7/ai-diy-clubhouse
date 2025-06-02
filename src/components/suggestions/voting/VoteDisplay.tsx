
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VoteDisplayProps {
  upvotes: number;
  downvotes: number;
  showTrend?: boolean;
  compact?: boolean;
}

const VoteDisplay: React.FC<VoteDisplayProps> = ({
  upvotes,
  downvotes,
  showTrend = false,
  compact = false
}) => {
  const total = upvotes + downvotes;
  const positivePercentage = total > 0 ? Math.round((upvotes / total) * 100) : 0;
  
  const getTrendIcon = () => {
    if (upvotes > downvotes) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (downvotes > upvotes) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-green-600 font-medium">{upvotes}</span>
          <span className="text-gray-400">•</span>
          <span className="text-red-600 font-medium">{downvotes}</span>
        </div>
        
        {showTrend && total > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getTrendIcon()}
            <span>{positivePercentage}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">{upvotes} apoios</span>
        <span className="text-gray-400">•</span>
        <span className="text-red-600 font-medium">{downvotes} contra</span>
      </div>
      
      {showTrend && total > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {getTrendIcon()}
          <span>{positivePercentage}% positivo</span>
        </div>
      )}
    </div>
  );
};

export default VoteDisplay;
