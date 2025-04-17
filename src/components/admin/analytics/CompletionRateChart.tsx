
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface CompletionRateChartProps {
  data: any[];
}

export const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Conclusão</CardTitle>
        <CardDescription>
          Implementações concluídas vs. em andamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PieChart 
          data={data}
          category="value"
          index="name"
          valueFormatter={(value) => `${value} implementações`}
          colors={['green', 'blue']}
          className="h-[200px]"
        />
      </CardContent>
    </Card>
  );
};
