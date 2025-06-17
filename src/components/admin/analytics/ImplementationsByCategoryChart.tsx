
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface ImplementationsByCategoryChartProps {
  data: any[];
}

export const ImplementationsByCategoryChart = ({ data }: ImplementationsByCategoryChartProps) => {
  return (
    <Card className="border-gray-800 bg-[#151823]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">Implementações por Categoria</CardTitle>
        <CardDescription className="text-gray-400">
          Distribuição por tipo de solução
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <PieChart 
            data={data}
            category="value"
            index="name"
            valueFormatter={(value) => `${value} implementações`}
            colors={['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B']}
            className="h-[200px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
