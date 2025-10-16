
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export const TrendIndicator = ({ 
  value, 
  size = 'md', 
  showBadge = true,
  className 
}: TrendIndicatorProps) => {
  const isPositive = value >= 0;
  const absValue = Math.abs(value);
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const content = (
    <div className={cn(
      "flex items-center gap-1",
      isPositive ? "text-success dark:text-success" : "text-destructive dark:text-destructive",
      textSizes[size],
      className
    )}>
      {isPositive ? (
        <TrendingUp className={sizeClasses[size]} />
      ) : (
        <TrendingDown className={sizeClasses[size]} />
      )}
      <span className="font-medium">
        {isPositive ? '+' : ''}{value}%
      </span>
    </div>
  );

  if (showBadge) {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "px-2 py-1",
          isPositive 
            ? "bg-success/10 text-success border-success/30 dark:bg-success/20 dark:text-success dark:border-success/50" 
            : "bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/50"
        )}
      >
        {content}
      </Badge>
    );
  }

  return content;
};
