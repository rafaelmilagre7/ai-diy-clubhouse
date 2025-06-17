
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

interface PopularSolutionsChartProps {
  data: any[];
}

export const PopularSolutionsChart = ({ data }: PopularSolutionsChartProps) => {
  return (
    <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#00EAD9]" />
          <CardTitle className="text-lg font-semibold text-white">Soluções Mais Populares</CardTitle>
        </div>
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
            colors={['#00EAD9']}
            valueFormatter={(value) => `${value} implementações`}
            className="h-[300px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p>Sem dados disponíveis para exibição</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
