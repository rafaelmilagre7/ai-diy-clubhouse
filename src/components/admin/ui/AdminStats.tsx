import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdminStatsProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

/**
 * Componente de estatísticas para o admin
 * Suporte a diferentes variantes e indicadores de tendência
 */
export const AdminStats = ({
  title,
  value,
  change,
  icon,
  className,
  variant = 'default',
  loading = false
}: AdminStatsProps) => {
  const variants = {
    default: 'bg-surface-elevated border-border/50',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-text-muted" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-text-muted';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        'rounded-xl border p-6',
        variants[variant],
        className
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted animate-pulse rounded w-24" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-8 bg-muted animate-pulse rounded w-20" />
          <div className="h-4 bg-muted animate-pulse rounded w-16" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border p-6 transition-all duration-200 hover:shadow-md',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-body-small text-text-secondary">
            {title}
          </p>
          <p className="text-heading-1 text-text-primary">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        
        {icon && (
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            variant === 'default' ? 'bg-aurora/10 text-aurora' : 'bg-current/10'
          )}>
            {icon}
          </div>
        )}
      </div>
      
      {change && (
        <div className="mt-4 flex items-center gap-2">
          {getTrendIcon(change.trend)}
          <span className={cn(
            'text-body-small font-medium',
            getTrendColor(change.trend)
          )}>
            {change.value > 0 && change.trend !== 'neutral' && '+'}
            {change.value}%
          </span>
          <span className="text-body-small text-text-muted">
            {change.period}
          </span>
        </div>
      )}
    </motion.div>
  );
};