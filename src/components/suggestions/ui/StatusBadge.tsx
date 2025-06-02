
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Wrench, XCircle, Eye } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

const statusConfig = {
  new: {
    label: 'Nova',
    icon: Eye,
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  under_review: {
    label: 'Em Análise',
    icon: Clock,
    variant: 'outline' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  in_development: {
    label: 'Em Desenvolvimento',
    icon: Wrench,
    variant: 'outline' as const,
    className: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  completed: {
    label: 'Concluída',
    icon: CheckCircle,
    variant: 'outline' as const,
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  declined: {
    label: 'Rejeitada',
    icon: XCircle,
    variant: 'outline' as const,
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

const sizeClasses = {
  default: 'gap-1 font-medium',
  sm: 'gap-1 font-medium text-xs px-2 py-1',
  lg: 'gap-2 font-semibold text-sm px-3 py-1.5'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className, 
  size = 'default' 
}) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  const Icon = config.icon;
  const sizeClass = sizeClasses[size];

  return (
    <Badge 
      variant={config.variant}
      className={`${sizeClass} ${config.className} ${className || ''}`}
    >
      <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} />
      {config.label}
    </Badge>
  );
};
