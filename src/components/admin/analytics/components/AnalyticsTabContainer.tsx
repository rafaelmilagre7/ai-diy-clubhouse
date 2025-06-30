
import React from 'react';
import { cn } from '@/lib/utils';

interface AnalyticsTabContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsTabContainer = ({ children, className }: AnalyticsTabContainerProps) => {
  return (
    <div className={cn("space-y-6 p-1", className)}>
      {children}
    </div>
  );
};

interface AnalyticsMetricsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const AnalyticsMetricsGrid = ({ 
  children, 
  columns = 4,
  className 
}: AnalyticsMetricsGridProps) => {
  const getGridClasses = () => {
    const columnClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };
    return `grid ${columnClasses[columns]} gap-4`;
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};

interface AnalyticsChartsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export const AnalyticsChartsGrid = ({
  children,
  columns = 2,
  className
}: AnalyticsChartsGridProps) => {
  const gridClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';
  
  return (
    <div className={cn(`grid ${gridClass} gap-6`, className)}>
      {children}
    </div>
  );
};
