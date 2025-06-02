
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/utils/suggestionUtils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'default' }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${sizeClasses[size]} border-2`}
      style={{ 
        borderColor: color, 
        color: color,
        backgroundColor: `${color}10`
      }}
    >
      {label}
    </Badge>
  );
};
