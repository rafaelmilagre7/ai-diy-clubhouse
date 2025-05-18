
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface WeeklyActivityChartProps {
  data: any[];
}

export const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-white">Atividade por Dia da Semana</CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          Quando os usuários estão mais ativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <BarChart 
            data={data}
            categories={['atividade']}
            index="name"
            colors={['#6366F1']}
            valueFormatter={(value) => `${value} ações`}
            className="h-[200px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-neutral-500 dark:text-neutral-400">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
