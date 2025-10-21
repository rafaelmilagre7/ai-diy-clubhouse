import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BuilderOverviewMetricsProps {
  solutions: any[];
  usageStats: any;
  loading: boolean;
}

export const BuilderOverviewMetrics: React.FC<BuilderOverviewMetricsProps> = ({
  solutions,
  usageStats,
  loading
}) => {
  const metrics = [
    {
      title: 'Total de Soluções',
      value: solutions?.length || 0,
      icon: Brain,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Usuários Ativos',
      value: usageStats?.activeUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Média por Usuário',
      value: usageStats?.avgPerUser || '0',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Soluções Concluídas',
      value: solutions?.filter(s => s.implementation_status === 'completed').length || 0,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {index === 0 && 'Soluções geradas no total'}
                {index === 1 && 'Usuários que já usaram'}
                {index === 2 && 'Gerações por pessoa'}
                {index === 3 && 'Implementações finalizadas'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
