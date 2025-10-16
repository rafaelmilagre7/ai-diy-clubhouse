
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface SolutionPopularityChartProps {
  data: any[];
}

export const SolutionPopularityChart: React.FC<SolutionPopularityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Soluções Mais Visualizadas</CardTitle>
          <CardDescription>
            Top 5 soluções com maior número de visualizações
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soluções Mais Visualizadas</CardTitle>
        <CardDescription>
          Top 5 soluções com maior número de visualizações
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <BarChart
          data={data}
          index="name"
          categories={['value']}
          colors={['hsl(var(--aurora-primary))']}
          valueFormatter={(value) => `${value} visualização${value !== 1 ? 'ões' : ''}`}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
