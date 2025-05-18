
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';

interface UserGrowthChartProps {
  data: any[];
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-white">Crescimento de Usuários</CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          Novos usuários registrados por mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <AreaChart 
            data={data}
            categories={['total']}
            index="name"
            colors={['#0ABAB5']}
            valueFormatter={(value) => `${value} usuários`}
            className="h-[300px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-neutral-500 dark:text-neutral-400">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
