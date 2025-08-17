
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
      blue: 'border-l-blue-500 bg-gradient-to-r from-blue-50/10 to-transparent',
      green: 'border-l-green-500 bg-gradient-to-r from-green-50/10 to-transparent',
      purple: 'border-l-purple-500 bg-gradient-to-r from-purple-50/10 to-transparent',
      orange: 'border-l-orange-500 bg-gradient-to-r from-orange-50/10 to-transparent',
      cyan: 'border-l-cyan-500 bg-gradient-to-r from-cyan-50/10 to-transparent',
      indigo: 'border-l-indigo-500 bg-gradient-to-r from-indigo-50/10 to-transparent',
      pink: 'border-l-pink-500 bg-gradient-to-r from-pink-50/10 to-transparent'
    };
    return schemes[colorScheme];
  };

  const getIconBgColor = () => {
    const schemes = {
      blue: 'bg-blue-500/10 text-blue-400',
      green: 'bg-green-500/10 text-green-400',
      purple: 'bg-purple-500/10 text-purple-400',
      orange: 'bg-orange-500/10 text-orange-400',
      cyan: 'bg-cyan-500/10 text-cyan-400',
      indigo: 'bg-indigo-500/10 text-indigo-400',
      pink: 'bg-pink-500/10 text-pink-400'
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
      "border-l-4 transition-all duration-200 hover:shadow-lg",
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
                  trend.value > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
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
