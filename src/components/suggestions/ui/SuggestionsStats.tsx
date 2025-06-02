
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageCircle, Clock, CheckCircle } from 'lucide-react';

interface SuggestionsStatsProps {
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

export const SuggestionsStats: React.FC<SuggestionsStatsProps> = ({ stats }) => {
  const statItems = [
    {
      title: 'Total',
      value: stats.total,
      icon: TrendingUp,
      description: 'Sugestões ativas'
    },
    {
      title: 'Novas',
      value: stats.byStatus.new || 0,
      icon: Clock,
      description: 'Aguardando análise'
    },
    {
      title: 'Em Desenvolvimento',
      value: stats.byStatus.in_development || 0,
      icon: MessageCircle,
      description: 'Sendo implementadas'
    },
    {
      title: 'Concluídas',
      value: stats.byStatus.completed || 0,
      icon: CheckCircle,
      description: 'Já implementadas'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
