
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Settings, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'new':
      return {
        label: 'Nova',
        icon: Clock,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'under_review':
      return {
        label: 'Em Análise',
        icon: AlertCircle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    case 'in_development':
      return {
        label: 'Em Desenvolvimento',
        icon: Settings,
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    case 'completed':
      return {
        label: 'Implementada',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'declined':
      return {
        label: 'Recusada',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    default:
      return {
        label: 'Nova',
        icon: Clock,
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1 font-medium`}
    >
      <Icon size={iconSizes[size]} />
      {config.label}
    </Badge>
  );
};
