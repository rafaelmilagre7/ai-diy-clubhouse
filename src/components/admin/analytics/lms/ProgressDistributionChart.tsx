import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { ProgressDistribution } from '@/hooks/analytics/lms/useRealLmsAnalytics';

interface ProgressDistributionChartProps {
  data: ProgressDistribution[];
  isLoading?: boolean;
}

export const ProgressDistributionChart = ({ data, isLoading }: ProgressDistributionChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Progresso</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.range,
    value: item.count,
    percentage: item.percentage
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Progresso dos Alunos</CardTitle>
        <CardDescription>
          Quantidade de alunos em cada faixa de progresso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
            <BarChart
              data={chartData}
              index="name"
              categories={["value"]}
              colors={["#0ABAB5"]}
              valueFormatter={(value) => `${value} alunos`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem dados de progresso disponíveis
            </div>
          )}
        </div>
        
        {chartData.length > 0 && chartData.some(d => d.value > 0) && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.map((item, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.name}</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">
                  {item.percentage}% do total
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
