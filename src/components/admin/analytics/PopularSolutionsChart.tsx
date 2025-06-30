
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface PopularSolutionsChartProps {
  data: any[];
}

export const PopularSolutionsChart = ({ data }: PopularSolutionsChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Soluções Mais Populares</CardTitle>
        <CardDescription>
          Top 5 soluções mais implementadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <BarChart 
            data={data}
            categories={['value']}
            index="name"
            colors={['#0ABAB5']}
            valueFormatter={(value) => `${value} implementações`}
            className="h-[300px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
