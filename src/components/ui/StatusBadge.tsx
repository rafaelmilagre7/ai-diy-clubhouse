import * as React from "react";
import { Badge, BadgeProps } from "./badge";
import { cn } from "@/lib/utils";

type Status = 'active' | 'pending' | 'completed' | 'inactive' | 'error';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: Status;
}

const statusConfig = {
  active: {
    variant: 'default' as const,
    label: 'Ativo',
    className: 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30'
  },
  pending: {
    variant: 'warning' as const,
    label: 'Pendente',
    className: 'bg-revenue/10 text-revenue border-revenue/30'
  },
  completed: {
    variant: 'success' as const,
    label: 'Concluído',
    className: 'bg-operational/10 text-operational border-operational/30'
  },
  inactive: {
    variant: 'neutral' as const,
    label: 'Inativo',
    className: 'bg-muted text-muted-foreground border-border'
  },
  error: {
    variant: 'destructive' as const,
    label: 'Erro',
    className: 'bg-destructive/10 text-destructive border-destructive/30'
  }
};

/**
 * Badge de status padronizado
 * Usa as cores do Design System baseado no estado
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className, 
  children, 
  ...props 
}) => {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
      {...props}
    >
      {children || config.label}
    </Badge>
  );
};
