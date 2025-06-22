
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { ImplementationData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface ImplementationsStatCardsProps {
  data: ImplementationData | undefined;
}

export const ImplementationsStatCards = ({ data }: ImplementationsStatCardsProps) => {
  if (!data) {
    return null;
  }

  const totalImplementations = data.completionRate.completed + data.completionRate.inProgress;
  const completionPercentage = totalImplementations > 0 
    ? Math.round((data.completionRate.completed / totalImplementations) * 100)
    : 0;

  const averageTimeDisplay = data.averageCompletionTime.length > 0
    ? `${data.averageCompletionTime.reduce((acc, item) => acc + item.avgDays, 0) / data.averageCompletionTime.length}d`
    : '0d';

  const averageAbandonmentRate = data.abandonmentByModule.length > 0
    ? Math.round(data.abandonmentByModule.reduce((acc, item) => acc + item.abandonmentRate, 0) / data.abandonmentByModule.length)
    : 0;

  const stats = [
    {
      title: 'Implementações Concluídas',
      value: data.completionRate.completed,
      icon: CheckCircle,
      description: 'Total de implementações finalizadas'
    },
    {
      title: 'Em Andamento',
      value: data.completionRate.inProgress,
      icon: Clock,
      description: 'Implementações atualmente ativas'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${completionPercentage}%`,
      icon: TrendingUp,
      description: 'Percentual de implementações concluídas'
    },
    {
      title: 'Taxa Média de Abandono',
      value: `${averageAbandonmentRate}%`,
      icon: Users,
      description: 'Percentual médio de abandono por módulo'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
