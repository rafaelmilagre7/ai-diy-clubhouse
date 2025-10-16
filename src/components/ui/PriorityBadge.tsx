import * as React from "react";
import { Badge, BadgeProps } from "./badge";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

type Priority = 'high' | 'medium' | 'low';

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: Priority;
  showIcon?: boolean;
}

const priorityConfig = {
  high: {
    variant: 'destructive' as const,
    label: 'Alta',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/30'
  },
  medium: {
    variant: 'warning' as const,
    label: 'Média',
    icon: AlertTriangle,
    className: 'bg-revenue/10 text-revenue border-revenue/30'
  },
  low: {
    variant: 'info' as const,
    label: 'Baixa',
    icon: Info,
    className: 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30'
  }
};

/**
 * Badge de prioridade padronizado
 * Usa as cores do Design System: Destructive (Alta), Revenue (Média), Aurora (Baixa)
 */
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  showIcon = false, 
  className, 
  children, 
  ...props 
}) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  
  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center gap-1",
        config.className,
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {children || config.label}
    </Badge>
  );
};
