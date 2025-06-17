
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ImplementationsByCategoryChartProps {
  data: any[];
}

export const ImplementationsByCategoryChart = ({ data }: ImplementationsByCategoryChartProps) => {
  return (
    <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-[#00EAD9]" />
          <CardTitle className="text-lg font-semibold text-white">Implementações por Categoria</CardTitle>
        </div>
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
            colors={['#00EAD9', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B']}
            className="h-[200px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p>Sem dados disponíveis para exibição</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
