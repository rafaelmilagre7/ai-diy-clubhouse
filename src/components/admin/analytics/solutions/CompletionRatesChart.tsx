
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface CompletionRatesChartProps {
  data: any[];
}

export const CompletionRatesChart: React.FC<CompletionRatesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxas de Conclusão</CardTitle>
          <CardDescription>
            Top 5 soluções com maiores taxas de conclusão
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
        <CardTitle>Taxas de Conclusão</CardTitle>
        <CardDescription>
          Top 5 soluções com maiores taxas de conclusão
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <BarChart
          data={data}
          index="name"
          categories={['value']}
          colors={['#3B82F6']}
          valueFormatter={(value) => `${value}%`}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
