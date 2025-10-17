import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
}

/**
 * Card padrão do admin com design system Aurora
 * Suporte a diferentes variantes e estados de loading
 */
export const AdminCard = ({
  children,
  className,
  title,
  subtitle,
  icon,
  actions,
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false
}: AdminCardProps) => {
  const variants = {
    default: 'surface-elevated border border-border/50',
    elevated: 'surface-overlay border border-border/50 shadow-lg',
    outline: 'border-2 border-aurora/20 bg-aurora/5',
    ghost: 'border border-transparent hover:border-border/50 hover:bg-surface-elevated'
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const CardComponent = interactive ? motion.div : 'div';

  const interactiveProps = interactive ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeOut' }
  } : {};

  if (loading) {
    return (
      <Card className={cn(variants[variant], className)}>
        <CardContent className={sizes[size]}>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardComponent
      className={cn(
        'rounded-xl transition-smooth',
        variants[variant],
        interactive && 'cursor-pointer interactive-hover',
        className
      )}
      {...interactiveProps}
    >
      {(title || subtitle || icon || actions) && (
        <CardHeader className="border-b border-border/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aurora/10 text-aurora">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-heading-3 text-text-primary">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-body-small text-text-muted mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={sizes[size]}>
        {children}
      </CardContent>
    </CardComponent>
  );
};