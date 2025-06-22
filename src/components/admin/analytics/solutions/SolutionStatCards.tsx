
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle, TrendingUp, Users } from 'lucide-react';

interface SolutionStatCardsProps {
  data: {
    totalSolutions: number;
    publishedSolutions: number;
    totalImplementations: number;
    averageCompletionRate: number;
    // Remover trends hardcoded
  };
}

export const SolutionStatCards = ({ data }: SolutionStatCardsProps) => {
  const stats = [
    {
      title: 'Total de Soluções',
      value: data.totalSolutions,
      icon: Target,
      description: 'Soluções criadas na plataforma'
    },
    {
      title: 'Soluções Publicadas',
      value: data.publishedSolutions,
      icon: CheckCircle,
      description: 'Soluções disponíveis para implementação'
    },
    {
      title: 'Implementações Totais',
      value: data.totalImplementations,
      icon: Users,
      description: 'Número total de implementações iniciadas'
    },
    {
      title: 'Taxa Média de Conclusão',
      value: `${data.averageCompletionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Percentual médio de conclusão das implementações'
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
              {/* REMOVIDO: trends hardcoded */}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
