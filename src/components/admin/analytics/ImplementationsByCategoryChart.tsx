
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface ImplementationsByCategoryChartProps {
  data: any[];
}

export const ImplementationsByCategoryChart = ({ data }: ImplementationsByCategoryChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementações por Categoria</CardTitle>
        <CardDescription>
          Distribuição por tipo de solução
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PieChart 
          data={data}
          category="value"
          index="name"
          valueFormatter={(value) => `${value} implementações`}
          className="h-[200px]"
        />
      </CardContent>
    </Card>
  );
};
