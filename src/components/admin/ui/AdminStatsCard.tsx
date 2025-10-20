import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down';
  description?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  loading?: boolean;
  className?: string;
}

/**
 * Card de estatísticas padronizado para área admin
 * Usa exclusivamente paleta turquesa Aurora
 */
export const AdminStatsCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection,
  description,
  variant = 'primary',
  loading = false,
  className
}: AdminStatsCardProps) => {
  const variants = {
    primary: {
      gradient: 'from-aurora-primary/20 to-operational/10',
      iconColor: 'text-aurora-primary',
      border: 'border-aurora-primary/30'
    },
    success: {
      gradient: 'from-success/20 to-success-light/10',
      iconColor: 'text-success',
      border: 'border-success/30'
    },
    warning: {
      gradient: 'from-warning/20 to-warning-light/10',
      iconColor: 'text-warning',
      border: 'border-warning/30'
    },
    info: {
      gradient: 'from-strategy/20 to-accent/10',
      iconColor: 'text-strategy',
      border: 'border-strategy/30'
    }
  };

  const variantStyles = variants[variant];

  if (loading) {
    return (
      <Card className={cn(
        'surface-elevated border backdrop-blur-sm',
        variantStyles.border,
        className
      )}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'surface-elevated border backdrop-blur-sm overflow-hidden',
      'group cursor-pointer transition-all duration-300',
      'hover:scale-[1.02] hover:shadow-lg',
      variantStyles.border,
      className
    )}>
      <div className={cn(
        'bg-gradient-to-r p-6 border-b border-border/30',
        variantStyles.gradient
      )}>
        <div className="flex items-center justify-between">
          <div className={cn(
            'p-3 rounded-xl surface-elevated bg-gradient-to-br',
            variantStyles.gradient
          )}>
            <Icon className={cn('h-6 w-6', variantStyles.iconColor)} />
          </div>
          <div className="text-right">
            <p className="text-heading-2 text-foreground group-hover:scale-110 transition-transform duration-300">
              {value}
            </p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-label font-medium text-foreground mb-1">
          {label}
        </p>
        
        {trend && (
          <div className="flex items-center gap-1 text-caption mb-1">
            {trendDirection === 'up' ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : trendDirection === 'down' ? (
              <TrendingDown className="h-3 w-3 text-destructive" />
            ) : null}
            <span className={cn(
              trendDirection === 'up' && 'text-success',
              trendDirection === 'down' && 'text-destructive'
            )}>
              {trend}
            </span>
          </div>
        )}
        
        {description && (
          <p className="text-caption text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
