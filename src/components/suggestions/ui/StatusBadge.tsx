
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'new':
      return {
        label: 'Nova',
        icon: AlertCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      };
    case 'under_review':
      return {
        label: 'Em Análise',
        icon: Clock,
        className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      };
    case 'in_development':
      return {
        label: 'Em Desenvolvimento',
        icon: Play,
        className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
      };
    case 'completed':
      return {
        label: 'Implementada',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      };
    case 'declined':
      return {
        label: 'Recusada',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
      };
    default:
      return {
        label: 'Desconhecido',
        icon: AlertCircle,
        className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
      };
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-0.5';
    case 'lg':
      return 'text-sm px-3 py-1';
    default:
      return 'text-xs px-2.5 py-0.5';
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className
}) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge 
      className={cn(
        'inline-flex items-center gap-1 font-medium border transition-colors',
        config.className,
        getSizeClasses(size),
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};
