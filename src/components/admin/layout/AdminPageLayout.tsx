import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AdminPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'wide';
}

/**
 * Layout padrão consistente para todas as páginas do admin
 * Implementa o design system Aurora com hierarquia visual clara
 */
export const AdminPageLayout = ({
  children,
  className,
  headerContent,
  breadcrumb,
  actions,
  title,
  subtitle,
  icon,
  variant = 'default'
}: AdminPageLayoutProps) => {
  const variants = {
    default: 'max-w-7xl',
    compact: 'max-w-4xl',
    wide: 'max-w-full'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'min-h-screen bg-background',
        className
      )}
    >
      {/* Header Section */}
      {(headerContent || title || breadcrumb) && (
        <div className="border-b border-border/50 bg-surface-elevated">
          <div className={cn('mx-auto px-6 py-6', variants[variant])}>
            {breadcrumb && (
              <div className="mb-4">
                {breadcrumb}
              </div>
            )}
            
            {headerContent || (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aurora/10 text-aurora">
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && (
                      <h1 className="text-heading-1 text-text-primary">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-body text-text-secondary mt-2">
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
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn('mx-auto px-6 py-8', variants[variant])}>
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </motion.div>
  );
};