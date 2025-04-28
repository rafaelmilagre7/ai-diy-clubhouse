
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { AlertCircle } from 'lucide-react';

interface PopularSolutionsChartProps {
  data: any[];
  isEmpty?: boolean;
}

export const PopularSolutionsChart = ({ data, isEmpty = false }: PopularSolutionsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Soluções Mais Populares</CardTitle>
        <CardDescription>
          Top 5 soluções mais implementadas
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-center">Sem dados suficientes para exibir</p>
          </div>
        ) : (
          <BarChart 
            data={data}
            categories={['value']}
            index="name"
            colors={['blue']}
            valueFormatter={(value) => `${value} implementações`}
            className="h-full w-full"
          />
        )}
      </CardContent>
    </Card>
  );
};
