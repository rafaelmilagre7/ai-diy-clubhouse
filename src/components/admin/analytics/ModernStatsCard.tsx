
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'indigo';
  loading?: boolean;
  className?: string;
}

const colorSchemes = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-600',
    trendPositive: 'text-blue-600',
    badgePositive: 'bg-blue-100 text-blue-700',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-600',
    trendPositive: 'text-purple-600',
    badgePositive: 'bg-purple-100 text-purple-700',
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-600',
    trendPositive: 'text-green-600',
    badgePositive: 'bg-green-100 text-green-700',
  },
  orange: {
    gradient: 'from-orange-500 to-yellow-500',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-600',
    trendPositive: 'text-orange-600',
    badgePositive: 'bg-orange-100 text-orange-700',
  },
  red: {
    gradient: 'from-red-500 to-rose-500',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-600',
    trendPositive: 'text-red-600',
    badgePositive: 'bg-red-100 text-red-700',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-600',
    trendPositive: 'text-indigo-600',
    badgePositive: 'bg-indigo-100 text-indigo-700',
  },
};

export const ModernStatsCard: React.FC<ModernStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  loading = false,
  className
}) => {
  const colors = colorSchemes[colorScheme];

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden border-0 shadow-xl", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            </div>
            {trend && (
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 hover:shadow-2xl transition-all duration-300 group",
      className
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
        colors.gradient
      )} />
      
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
            colors.iconBg
          )}>
            <Icon className={cn("h-6 w-6", colors.iconColor)} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center space-x-2">
            {trend.type === 'positive' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend.type === 'negative' ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : null}
            
            <Badge 
              variant="secondary"
              className={cn(
                "text-xs font-medium",
                trend.type === 'positive' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                trend.type === 'negative' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                trend.type === 'neutral' && "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
              )}
            >
              {trend.type !== 'neutral' && (trend.type === 'positive' ? '+' : '')}{trend.value}% {trend.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
