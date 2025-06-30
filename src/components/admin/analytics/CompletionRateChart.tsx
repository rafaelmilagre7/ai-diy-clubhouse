
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface CompletionRateChartProps {
  data: any[];
}

export const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Taxa de Conclusão</CardTitle>
        <CardDescription>
          Implementações concluídas vs. em andamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <PieChart 
            data={data}
            category="value"
            index="name"
            valueFormatter={(value) => `${value} implementações`}
            colors={['#10B981', '#0ABAB5']}
            className="h-[200px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
