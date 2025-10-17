import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface OptimizedKpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

// Componente memoizado para evitar re-renderizações desnecessárias
export const OptimizedKpiGrid = memo(({ 
  completed, 
  inProgress, 
  total, 
  isLoading = false 
}: OptimizedKpiGridProps) => {
  
  // Memoizar cálculos de porcentagem para performance
  const stats = useMemo(() => {
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    
    return {
      completionRate,
      progressRate,
      totalItems: total
    };
  }, [completed, inProgress, total]);

  const kpiItems = useMemo(() => [
    {
      id: 'completed',
      title: 'Soluções Concluídas',
      value: completed,
      percentage: stats.completionRate,
      icon: Trophy,
      colorClass: 'text-operational',
      bgClass: 'bg-operational/10',
      description: 'Implementações finalizadas'
    },
    {
      id: 'progress',
      title: 'Em Andamento',
      value: inProgress,
      percentage: stats.progressRate,
      icon: Target,
      colorClass: 'text-operational',
      bgClass: 'bg-operational/10',
      description: 'Soluções em implementação'
    },
    {
      id: 'total',
      title: 'Total Disponível',
      value: total,
      percentage: 100,
      icon: TrendingUp,
      colorClass: 'text-strategy',
      bgClass: 'bg-strategy/10',
      description: 'Soluções na plataforma'
    }
  ], [completed, inProgress, total, stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpiItems.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <Card 
            key={item.id} 
            className="group hover:shadow-md transition-all duration-300 hover-scale border-l-4 border-l-primary/20 hover:border-l-primary"
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${item.bgClass} group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-6 w-6 ${item.colorClass}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    {item.percentage !== 100 && (
                      <span className={`text-xs font-medium ${item.colorClass}`}>
                        {item.percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

OptimizedKpiGrid.displayName = 'OptimizedKpiGrid';