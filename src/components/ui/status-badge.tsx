import * as React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
type StatusVariant = 'default' | 'light' | 'lighter';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
  statusVariant?: StatusVariant;
}

/**
 * Status Badge - Fase 14 Normalização Semântica
 * Badge padronizado usando cores semânticas do Design System
 * Substitui uso de cores hardcoded (bg-green-50, bg-red-50, etc.)
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  statusVariant = 'lighter',
  children, 
  className,
  ...props 
}) => {
  const statusClasses = {
    success: {
      default: 'bg-status-success text-white border-status-success',
      light: 'bg-status-success-light text-status-success-dark border-status-success',
      lighter: 'bg-status-success-lighter text-status-success border-status-success/20',
    },
    error: {
      default: 'bg-status-error text-white border-status-error',
      light: 'bg-status-error-light text-status-error-dark border-status-error',
      lighter: 'bg-status-error-lighter text-status-error border-status-error/20',
    },
    warning: {
      default: 'bg-status-warning text-white border-status-warning',
      light: 'bg-status-warning-light text-status-warning-dark border-status-warning',
      lighter: 'bg-status-warning-lighter text-status-warning border-status-warning/20',
    },
    info: {
      default: 'bg-status-info text-white border-status-info',
      light: 'bg-status-info-light text-status-info-dark border-status-info',
      lighter: 'bg-status-info-lighter text-status-info border-status-info/20',
    },
    neutral: {
      default: 'bg-status-neutral text-white border-status-neutral',
      light: 'bg-status-neutral-light text-status-neutral-dark border-status-neutral',
      lighter: 'bg-status-neutral-lighter text-status-neutral border-status-neutral/20',
    },
  };

  return (
    <Badge 
      variant="outline"
      className={cn(statusClasses[status][statusVariant], className)}
      {...props}
    >
      {children}
    </Badge>
  );
};
