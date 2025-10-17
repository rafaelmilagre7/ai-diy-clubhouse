
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface CategoryDistributionChartProps {
  data: any[];
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>
            Soluções agrupadas por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="h-chart-md flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
        <CardDescription>
          Soluções agrupadas por categoria
        </CardDescription>
      </CardHeader>
      <CardContent className="h-chart-md">
        <PieChart
          data={data}
          index="name"
          category="value"
          valueFormatter={(value) => `${value} solução${value !== 1 ? 'ões' : ''}`}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
