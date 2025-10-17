
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { ImplementationData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface CompletionTimeChartProps {
  data: ImplementationData['averageCompletionTime'];
  loading: boolean;
}

export const CompletionTimeChart: React.FC<CompletionTimeChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse h-6 w-3/4 bg-muted rounded mb-2"></CardTitle>
          <CardDescription className="animate-pulse h-4 w-1/2 bg-muted rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-chart-md w-full animate-pulse bg-muted/50 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Formatar os dados para o gráfico
  const chartData = data.map(item => ({
    name: item.solutionTitle.length > 20 
      ? `${item.solutionTitle.substring(0, 20)}...` 
      : item.solutionTitle,
    dias: item.avgDays,
    implementacoes: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo Médio de Conclusão</CardTitle>
        <CardDescription>
          Tempo médio necessário para concluir cada solução (em dias)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <BarChart
            data={chartData}
            categories={['dias']}
            index="name"
            colors={['blue']}
            valueFormatter={(value) => `${value} dias`}
            className="h-chart-md"
          />
        ) : (
          <div className="flex items-center justify-center h-chart-md">
            <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
