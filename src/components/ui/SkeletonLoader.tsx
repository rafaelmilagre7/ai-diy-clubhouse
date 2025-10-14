import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'default' | 'circle' | 'organic';
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'default',
  className,
  count = 1
}) => {
  const variantClasses = {
    default: 'skeleton-loader',
    circle: 'skeleton-loader skeleton-circle',
    organic: 'skeleton-loader skeleton-organic'
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            variantClasses[variant],
            className
          )}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

interface SkeletonCardProps {
  variant?: 'match' | 'connection' | 'metric';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'match' }) => {
  if (variant === 'match') {
    return (
      <div className="liquid-glass-card p-6 space-y-4">
        {/* Avatar */}
        <div className="flex items-start gap-4">
          <SkeletonLoader variant="circle" className="w-16 h-16 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-6 w-3/4" />
            <SkeletonLoader className="h-4 w-1/2" />
          </div>
        </div>

        {/* Badge */}
        <SkeletonLoader className="h-6 w-32" />

        {/* Content */}
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-5/6" />
          <SkeletonLoader className="h-4 w-4/6" />
        </div>

        {/* Opportunities */}
        <div className="space-y-2">
          <SkeletonLoader className="h-3 w-full" />
          <SkeletonLoader className="h-3 w-full" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <SkeletonLoader className="h-10 flex-1" />
          <SkeletonLoader className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (variant === 'connection') {
    return (
      <div className="liquid-glass-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <SkeletonLoader variant="circle" className="w-14 h-14 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-5 w-2/3" />
            <SkeletonLoader className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex gap-2">
          <SkeletonLoader className="h-8 flex-1" />
          <SkeletonLoader className="h-8 flex-1" />
          <SkeletonLoader className="h-8 flex-1" />
        </div>
      </div>
    );
  }

  if (variant === 'metric') {
    return (
      <div className="liquid-glass-card p-6 space-y-3">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-10 w-20" />
        <SkeletonLoader className="h-3 w-32" />
      </div>
    );
  }

  return null;
};

interface SkeletonGridProps {
  count?: number;
  variant?: 'match' | 'connection' | 'metric';
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ 
  count = 6, 
  variant = 'match' 
}) => {
  return (
    <div className={cn(
      "grid gap-6",
      variant === 'match' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      variant === 'connection' && "grid-cols-1 md:grid-cols-2",
      variant === 'metric' && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
};
