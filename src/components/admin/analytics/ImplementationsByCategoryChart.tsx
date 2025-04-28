
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';
import { AlertCircle } from 'lucide-react';

interface ImplementationsByCategoryChartProps {
  data: any[];
  isEmpty?: boolean;
}

export const ImplementationsByCategoryChart = ({ data, isEmpty = false }: ImplementationsByCategoryChartProps) => {
  // Verificar se todos os valores são zero
  const allZeros = !isEmpty && data.every(item => item.value === 0);
  const shouldShowEmpty = isEmpty || allZeros;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementações por Categoria</CardTitle>
        <CardDescription>
          Distribuição por tipo de solução
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[200px] w-full">
        {shouldShowEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-center">Sem dados suficientes para exibir</p>
          </div>
        ) : (
          <PieChart 
            data={data}
            category="value"
            index="name"
            valueFormatter={(value) => `${value} implementações`}
            className="h-full w-full"
            colors={["#0088FE", "#00C49F", "#FFBB28"]}
          />
        )}
      </CardContent>
    </Card>
  );
};
