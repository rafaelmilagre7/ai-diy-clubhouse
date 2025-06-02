
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant="secondary"
      className={cn(
        getStatusColor(status),
        sizeClasses[size],
        'font-medium',
        className
      )}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};
