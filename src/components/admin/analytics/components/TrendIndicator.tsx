
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrendIndicator = ({ 
  value, 
  suffix = '%',
  showBadge = true,
  size = 'md',
  className 
}: TrendIndicatorProps) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const getIcon = () => {
    if (isNeutral) return Minus;
    return isPositive ? TrendingUp : TrendingDown;
  };
  
  const getColor = () => {
    if (isNeutral) return 'text-gray-500';
    return isPositive ? 'text-green-500' : 'text-red-500';
  };
  
  const getBadgeVariant = () => {
    if (isNeutral) return 'neutral';
    return isPositive ? 'success' : 'destructive';
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };
  
  const Icon = getIcon();
  
  if (showBadge) {
    return (
      <Badge 
        variant={getBadgeVariant()} 
        className={cn("flex items-center gap-1 text-xs", className)}
      >
        <Icon className={getSizeClasses()} />
        {Math.abs(value)}{suffix}
      </Badge>
    );
  }
  
  return (
    <div className={cn("flex items-center gap-1", getColor(), className)}>
      <Icon className={getSizeClasses()} />
      <span className="text-sm font-medium">
        {Math.abs(value)}{suffix}
      </span>
    </div>
  );
};
