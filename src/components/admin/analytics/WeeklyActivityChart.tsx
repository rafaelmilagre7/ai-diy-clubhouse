
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface WeeklyActivityChartProps {
  data: any[];
}

export const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade por Dia da Semana</CardTitle>
        <CardDescription>
          Quando os usuários estão mais ativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart 
          data={data}
          categories={['atividade']}
          index="name"
          colors={['blue']}
          valueFormatter={(value) => `${value} ações`}
          className="h-[200px]"
        />
      </CardContent>
    </Card>
  );
};
