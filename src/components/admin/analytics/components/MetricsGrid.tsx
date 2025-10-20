
import React from 'react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricsGrid = ({ 
  children, 
  columns = 4,
  gap = 'md',
  className 
}: MetricsGridProps) => {
  const getGridClasses = () => {
    const columnClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg'
    };

    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};
