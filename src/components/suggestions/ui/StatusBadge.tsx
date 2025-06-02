
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Wrench, XCircle, Eye } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`gap-1 font-medium ${config.className} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
