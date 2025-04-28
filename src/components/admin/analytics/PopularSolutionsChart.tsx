
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface PopularSolutionsChartProps {
  data: any[];
}

export const PopularSolutionsChart = ({ data }: PopularSolutionsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Soluções Mais Populares</CardTitle>
        <CardDescription>
          Top 5 soluções mais implementadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart 
          data={data}
          categories={['value']}
          index="name"
          colors={['blue']}
          valueFormatter={(value) => `${value} implementações`}
          className="h-[300px]"
        />
      </CardContent>
    </Card>
  );
};
