
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const netVotes = upvotes - downvotes;
  const upvotePercentage = totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0;

  const getTrendIcon = () => {
    if (!showTrend || totalVotes < 5) return null;
    
    if (upvotePercentage >= 70) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (upvotePercentage <= 30) {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  const getScoreColor = () => {
    if (netVotes > 5) return 'text-green-600';
    if (netVotes < -2) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${getScoreColor()}`}>
          {netVotes > 0 ? '+' : ''}{netVotes}
        </span>
        {getTrendIcon()}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          👍 {upvotes}
        </Badge>
        <Badge variant="outline" className="text-xs">
          👎 {downvotes}
        </Badge>
      </div>
      
      {totalVotes > 0 && (
        <div className="text-xs text-muted-foreground">
          {Math.round(upvotePercentage)}% positivo
        </div>
      )}
    </div>
  );
};
