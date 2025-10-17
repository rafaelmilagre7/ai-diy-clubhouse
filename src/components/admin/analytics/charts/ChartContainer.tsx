
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  actions?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  children,
  loading = false,
  className,
  size = 'medium',
  actions
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'h-[250px]';
      case 'large': return 'h-[450px]';
      default: return 'h-chart-md';
    }
  };

  return (
    <Card className={cn(
      "bg-card border-border shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-muted-foreground mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("p-6", getSizeClasses())}>
        {loading ? <ChartSkeleton size={size} /> : children}
      </CardContent>
    </Card>
  );
};

// Componente de skeleton para loading
export const ChartSkeleton: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const getSkeletonHeight = () => {
    switch (size) {
      case 'small': return 'h-chart-sm';
      case 'large': return 'h-chart-lg';
      default: return 'h-chart-md';
    }
  };

  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className={cn("w-full rounded-lg", getSkeletonHeight())} />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
};
