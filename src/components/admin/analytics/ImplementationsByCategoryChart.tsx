
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface ImplementationsByCategoryChartProps {
  data: any[];
}

export const ImplementationsByCategoryChart = ({ data }: ImplementationsByCategoryChartProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">Implementações por Categoria</CardTitle>
        <CardDescription className="text-muted-foreground">
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
            colors={['#0ABAB5', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B']}
            className="h-[200px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Sem dados disponíveis para exibição
          </div>
        )}
      </CardContent>
    </Card>
  );
};
