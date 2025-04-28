
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { AlertCircle } from 'lucide-react';

interface WeeklyActivityChartProps {
  data: any[];
  isEmpty?: boolean;
}

export const WeeklyActivityChart = ({ data, isEmpty = false }: WeeklyActivityChartProps) => {
  // Verificar se todos os valores são zero
  const allZeros = !isEmpty && data.every(item => item.atividade === 0);
  const shouldShowEmpty = isEmpty || allZeros;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade por Dia</CardTitle>
        <CardDescription>
          Quando os usuários estão mais ativos
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[200px] w-full">
        {shouldShowEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-center">Sem dados suficientes para exibir</p>
          </div>
        ) : (
          <BarChart 
            data={data}
            categories={['atividade']}
            index="name"
            colors={['blue']}
            valueFormatter={(value) => `${value} ações`}
            className="h-full w-full"
          />
        )}
      </CardContent>
    </Card>
  );
};
