
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedKpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

// Componente KPI otimizado com memoização
export const OptimizedKpiGrid = memo<OptimizedKpiGridProps>(({ 
  completed, 
  inProgress, 
  total,
  isLoading = false 
}) => {
  // Memoizar dados calculados
  const kpiData = useMemo(() => [
    {
      title: "Implementações Concluídas",
      value: completed,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    },
    {
      title: "Em Andamento",
      value: inProgress,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      title: "Total Disponível",
      value: total,
      icon: Target,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    }
  ], [completed, inProgress, total]);

  // Memoizar componente de loading
  const LoadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i} className="bg-[#151823] border-neutral-700">
          <CardHeader className="pb-2">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
              <div className="h-8 bg-neutral-700 rounded w-1/2" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  ), []);

  if (isLoading) {
    return LoadingSkeleton;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.title}
            className={cn(
              "bg-[#151823] border-neutral-700 transition-all duration-300 hover:shadow-lg",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                {kpi.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", kpi.bgColor)}>
                <Icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

OptimizedKpiGrid.displayName = 'OptimizedKpiGrid';
