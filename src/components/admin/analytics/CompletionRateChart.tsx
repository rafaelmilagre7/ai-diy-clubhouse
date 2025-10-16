
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface CompletionRateChartProps {
  data: any[];
}

export const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">Taxa de Conclusão</CardTitle>
        <CardDescription className="text-muted-foreground">
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
            colors={['hsl(var(--success))', 'hsl(var(--aurora-primary))']}
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
