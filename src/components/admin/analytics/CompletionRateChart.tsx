
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';
import { AlertCircle } from 'lucide-react';

interface CompletionRateChartProps {
  data: any[];
  isEmpty?: boolean;
}

export const CompletionRateChart = ({ data, isEmpty = false }: CompletionRateChartProps) => {
  // Verificar se todos os valores são zero
  const allZeros = !isEmpty && data.every(item => item.value === 0);
  const shouldShowEmpty = isEmpty || allZeros;
  
  // Calcular a porcentagem
  const total = !isEmpty ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  const completedPercentage = total > 0 ? Math.round((data[0]?.value || 0) / total * 100) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Conclusão</CardTitle>
        <CardDescription>
          {shouldShowEmpty 
            ? 'Implementações concluídas vs. em andamento' 
            : `${completedPercentage}% concluídas`}
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
            colors={['green', 'blue']}
            className="h-full w-full"
          />
        )}
      </CardContent>
    </Card>
  );
};
