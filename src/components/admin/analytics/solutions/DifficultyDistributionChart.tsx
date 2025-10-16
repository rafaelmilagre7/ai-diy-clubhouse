
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface DifficultyDistributionChartProps {
  data: any[];
}

export const DifficultyDistributionChart: React.FC<DifficultyDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Dificuldade</CardTitle>
          <CardDescription>
            Soluções agrupadas por nível de dificuldade
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
        <CardTitle>Distribuição por Dificuldade</CardTitle>
        <CardDescription>
          Soluções agrupadas por nível de dificuldade
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <PieChart
          data={data}
          index="name"
          category="value"
          valueFormatter={(value) => `${value} solução${value !== 1 ? 'ões' : ''}`}
          className="h-full"
          colors={["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"]}
        />
      </CardContent>
    </Card>
  );
};
