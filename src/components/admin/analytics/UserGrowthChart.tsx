
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';
import { AlertCircle } from 'lucide-react';

interface UserGrowthChartProps {
  data: any[];
  isEmpty?: boolean;
}

export const UserGrowthChart = ({ data, isEmpty = false }: UserGrowthChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Usuários</CardTitle>
        <CardDescription>
          Novos usuários registrados por mês
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-center">Sem dados suficientes para exibir</p>
          </div>
        ) : (
          <AreaChart 
            data={data}
            categories={['total']}
            index="name"
            colors={['blue']}
            valueFormatter={(value) => `${value} usuários`}
            className="h-full w-full"
          />
        )}
      </CardContent>
    </Card>
  );
};
