
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';

interface UserGrowthChartProps {
  data: any[];
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Usuários</CardTitle>
        <CardDescription>
          Novos usuários registrados por mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AreaChart 
          data={data}
          categories={['total']}
          index="name"
          colors={['blue']}
          valueFormatter={(value) => `${value} usuários`}
          className="h-[300px]"
        />
      </CardContent>
    </Card>
  );
};
