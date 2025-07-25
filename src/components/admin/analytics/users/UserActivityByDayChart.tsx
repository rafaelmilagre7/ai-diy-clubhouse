
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface UserActivityByDayChartProps {
  data: any[];
}

export const UserActivityByDayChart: React.FC<UserActivityByDayChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade por Dia da Semana</CardTitle>
          <CardDescription>
            Quando os usuários estão mais ativos
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade por Dia da Semana</CardTitle>
        <CardDescription>
          Quando os usuários estão mais ativos
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <BarChart
          data={data}
          index="name"
          categories={['atividade']}
          colors={['#0ABAB5']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
