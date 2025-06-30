
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
      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
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
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800" 
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
        )}
      >
        {content}
      </Badge>
    );
  }

  return content;
};
