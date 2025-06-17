
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
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    badgePositive: 'bg-green-500/20 text-green-400',
  },
  purple: {
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    badgePositive: 'bg-green-500/20 text-green-400',
  },
  green: {
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    badgePositive: 'bg-green-500/20 text-green-400',
  },
  orange: {
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    badgePositive: 'bg-green-500/20 text-green-400',
  },
  red: {
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    badgePositive: 'bg-green-500/20 text-green-400',
  },
  indigo: {
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    badgePositive: 'bg-green-500/20 text-green-400',
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
      <Card className={cn("border-gray-800 bg-[#151823]", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-8 bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-700 rounded-xl"></div>
            </div>
            {trend && (
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-gray-800 bg-[#151823] hover:bg-[#1A1F2E] transition-all duration-300 group",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
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
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : trend.type === 'negative' ? (
              <TrendingDown className="h-4 w-4 text-red-400" />
            ) : null}
            
            <Badge 
              variant="secondary"
              className={cn(
                "text-xs font-medium border-0",
                trend.type === 'positive' && "bg-green-500/20 text-green-400",
                trend.type === 'negative' && "bg-red-500/20 text-red-400",
                trend.type === 'neutral' && "bg-gray-500/20 text-gray-400"
              )}
            >
              {trend.type !== 'neutral' && (trend.type === 'positive' ? '+' : '')}{Math.abs(trend.value).toFixed(1)}% {trend.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
