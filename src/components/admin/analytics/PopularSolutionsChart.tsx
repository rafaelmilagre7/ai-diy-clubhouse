
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface PopularSolutionsChartProps {
  data: any[];
}

export const PopularSolutionsChart = ({ data }: PopularSolutionsChartProps) => {
  return (
    <Card className="border-gray-800 bg-[#151823]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">Soluções Mais Populares</CardTitle>
        <CardDescription className="text-gray-400">
          Top 5 soluções mais implementadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <BarChart 
            data={data}
            categories={['value']}
            index="name"
            colors={['#F59E0B']}
            valueFormatter={(value) => `${value} implementações`}
            className="h-[300px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
