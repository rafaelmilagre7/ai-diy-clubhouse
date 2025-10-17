
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';
import { ImplementationData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface DifficultyDistributionChartProps {
  data: ImplementationData['implementationsByDifficulty'];
  loading: boolean;
}

export const DifficultyDistributionChart: React.FC<DifficultyDistributionChartProps> = ({ data, loading }) => {
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

  // Traduzir dificuldades para português
  const difficultyLabels: Record<string, string> = {
    'beginner': 'Iniciante',
    'intermediate': 'Intermediário',
    'advanced': 'Avançado',
    'expert': 'Especialista',
    'Desconhecido': 'Não especificado'
  };

  // Formatar dados para o gráfico
  const chartData = data.map(item => ({
    name: difficultyLabels[item.difficulty] || item.difficulty,
    value: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Nível</CardTitle>
        <CardDescription>
          Implementações por nível de dificuldade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <PieChart
            data={chartData}
            category="value"
            index="name"
            valueFormatter={(value) => `${value} implementações`}
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
