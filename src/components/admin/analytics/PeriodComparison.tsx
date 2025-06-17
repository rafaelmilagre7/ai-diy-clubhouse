
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonData {
  metric: string;
  currentValue: number;
  previousValue: number;
  unit?: string;
  format?: 'number' | 'percentage' | 'currency';
}

interface PeriodComparisonProps {
  title: string;
  currentPeriod: string;
  previousPeriod: string;
  data: ComparisonData[];
  loading?: boolean;
}

export const PeriodComparison: React.FC<PeriodComparisonProps> = ({
  title,
  currentPeriod,
  previousPeriod,
  data,
  loading = false
}) => {
  const formatValue = (value: number, format?: string, unit?: string) => {
    let formatted = '';
    
    switch (format) {
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'currency':
        formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
        break;
      default:
        formatted = value.toLocaleString('pt-BR');
        break;
    }
    
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeType = (change: number): 'positive' | 'negative' | 'neutral' => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const getChangeIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">{currentPeriod}</span>
          <ArrowRight className="h-3 w-3" />
          <span>vs {previousPeriod}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {data.map((item, index) => {
          const change = calculateChange(item.currentValue, item.previousValue);
          const changeType = getChangeType(change);
          const progressValue = item.previousValue > 0 
            ? Math.min(100, (item.currentValue / item.previousValue) * 100)
            : item.currentValue > 0 ? 100 : 0;

          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {item.metric}
                </span>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    changeType === 'positive' && "bg-green-100 text-green-700",
                    changeType === 'negative' && "bg-red-100 text-red-700",
                    changeType === 'neutral' && "bg-gray-100 text-gray-700"
                  )}
                >
                  {getChangeIcon(changeType)}
                  {changeType === 'neutral' ? '0%' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900">
                    {formatValue(item.currentValue, item.format, item.unit)}
                  </div>
                  <div className="text-slate-500">
                    {formatValue(item.previousValue, item.format, item.unit)} anterior
                  </div>
                </div>
              </div>
              
              <Progress 
                value={progressValue} 
                className="h-2"
                indicatorClassName={cn(
                  changeType === 'positive' && "bg-gradient-to-r from-green-500 to-emerald-500",
                  changeType === 'negative' && "bg-gradient-to-r from-red-500 to-rose-500",
                  changeType === 'neutral' && "bg-gradient-to-r from-gray-400 to-gray-500"
                )}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
