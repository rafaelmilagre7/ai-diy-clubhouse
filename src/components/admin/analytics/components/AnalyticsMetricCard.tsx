
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AnalyticsMetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'pink';
  loading?: boolean;
  className?: string;
}

export const AnalyticsMetricCard = ({
  title,
  value,
  icon,
  trend,
  colorScheme = 'blue',
  loading = false,
  className
}: AnalyticsMetricCardProps) => {
  const getColorClasses = () => {
    const schemes = {
      blue: 'border-l-operational gradient-operational-subtle',
      green: 'border-l-success gradient-success-card',
      purple: 'border-l-strategy gradient-strategy-subtle',
      orange: 'border-l-warning gradient-warning-card',
      cyan: 'border-l-aurora-primary gradient-aurora-subtle',
      indigo: 'border-l-operational gradient-operational-subtle',
      pink: 'border-l-accent gradient-primary-subtle'
    };
    return schemes[colorScheme];
  };

  const getIconBgColor = () => {
    const schemes = {
      blue: 'bg-operational/10 text-operational',
      green: 'bg-success/10 text-success',
      purple: 'bg-strategy/10 text-strategy',
      orange: 'bg-warning/10 text-warning',
      cyan: 'bg-aurora-primary/10 text-aurora-primary',
      indigo: 'bg-operational/10 text-operational',
      pink: 'bg-accent/10 text-accent'
    };
    return schemes[colorScheme];
  };

  if (loading) {
    return (
      <Card className={cn("border-l-4", getColorClasses(), className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-l-4 transition-smooth hover:shadow-lg",
      getColorClasses(),
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {trend && (
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  trend.value > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </div>
              )}
            </div>
          </div>
          
          {icon && (
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              getIconBgColor()
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      {trend && trend.label && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {trend.label}
          </p>
        </CardContent>
      )}
    </Card>
  );
};
