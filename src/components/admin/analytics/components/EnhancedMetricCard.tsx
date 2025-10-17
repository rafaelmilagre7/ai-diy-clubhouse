
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendIndicator } from './TrendIndicator';
import { MiniSparkline } from './MiniSparkline';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SparklineData {
  value: number;
  date?: string;
}

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  sparklineData?: SparklineData[];
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'pink';
  loading?: boolean;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

export const EnhancedMetricCard = ({
  title,
  value,
  icon,
  trend,
  sparklineData,
  colorScheme = 'blue',
  loading = false,
  className,
  priority = 'medium'
}: EnhancedMetricCardProps) => {
  const getColorClasses = () => {
    const schemes = {
      blue: {
        border: 'border-l-operational',
        icon: 'text-operational bg-operational/10 dark:bg-operational/20',
        gradient: 'from-operational/10 to-transparent dark:from-operational/10'
      },
      green: {
        border: 'border-l-success',
        icon: 'text-success bg-success/10 dark:bg-success/20',
        gradient: 'from-success/10 to-transparent dark:from-success/10'
      },
      purple: {
        border: 'border-l-strategy',
        icon: 'text-strategy bg-strategy/10 dark:bg-strategy/20',
        gradient: 'from-strategy/10 to-transparent dark:from-strategy/10'
      },
      orange: {
        border: 'border-l-warning',
        icon: 'text-warning bg-warning/10 dark:bg-warning/20',
        gradient: 'from-warning/10 to-transparent dark:from-warning/10'
      },
      cyan: {
        border: 'border-l-aurora-primary',
        icon: 'text-aurora-primary bg-aurora-primary/10 dark:bg-aurora-primary/20',
        gradient: 'from-aurora-primary/10 to-transparent dark:from-aurora-primary/10'
      },
      indigo: {
        border: 'border-l-operational',
        icon: 'text-operational bg-operational/10 dark:bg-operational/20',
        gradient: 'from-operational/10 to-transparent dark:from-operational/10'
      },
      pink: {
        border: 'border-l-accent',
        icon: 'text-accent bg-accent/10 dark:bg-accent/20',
        gradient: 'from-accent/10 to-transparent dark:from-accent/10'
      }
    };
    return schemes[colorScheme];
  };

  const getPriorityClasses = () => {
    switch (priority) {
      case 'high': return 'ring-2 ring-primary/20 shadow-lg';
      case 'low': return 'opacity-90';
      default: return '';
    }
  };

  const colors = getColorClasses();

  if (loading) {
    return (
      <Card className={cn("border-l-4", colors.border, className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          {sparklineData && (
            <div className="mt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "border-l-4 transition-smooth hover:shadow-md",
        "bg-gradient-to-r",
        colors.border,
        colors.gradient,
        getPriorityClasses(),
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-foreground">
                {value}
              </h3>
              {trend && (
                <TrendIndicator 
                  value={trend.value}
                  size="sm"
                  showBadge={false}
                />
              )}
            </div>
            {trend && trend.label && (
              <p className="text-xs text-muted-foreground">
                {trend.label}
              </p>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              colors.icon
            )}>
              {icon}
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4">
            <MiniSparkline 
              data={sparklineData}
              color={`var(--${colorScheme}-500)`}
              height={32}
              className="w-full"
            />
          </div>
        )}

        {trend && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <TrendIndicator 
              value={trend.value}
              showBadge={true}
              size="sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
