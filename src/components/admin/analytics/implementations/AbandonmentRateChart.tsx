
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { ImplementationData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface AbandonmentRateChartProps {
  data: ImplementationData['abandonmentByModule'];
  loading: boolean;
}

export const AbandonmentRateChart: React.FC<AbandonmentRateChartProps> = ({ data, loading }) => {
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

  // Filtrar apenas módulos com dados significativos
  const filteredData = data
    .filter(item => item.totalStarts >= 5) // Apenas módulos com pelo menos 5 interações
    .slice(0, 8); // Mostrar apenas os 8 módulos com maior taxa de abandono
  
  // Formatar dados para o gráfico
  const chartData = filteredData.map(item => ({
    name: item.moduleTitle.length > 15 
      ? `${item.moduleTitle.substring(0, 15)}...` 
      : item.moduleTitle,
    taxa: item.abandonmentRate,
    starts: item.totalStarts
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Abandono por Módulo</CardTitle>
        <CardDescription>
          Módulos com maior taxa de desistência
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <BarChart
            data={chartData}
            categories={['taxa']}
            index="name"
            colors={['red']}
            valueFormatter={(value) => `${value}%`}
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
