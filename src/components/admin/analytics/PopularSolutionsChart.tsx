
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface PopularSolutionsChartProps {
  data: any[];
}

export const PopularSolutionsChart = ({ data }: PopularSolutionsChartProps) => {
  // Validação mais flexível dos dados
  const hasValidData = data && Array.isArray(data) && data.length > 0;
  
  if (!hasValidData) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Soluções Mais Populares</CardTitle>
          <CardDescription className="text-muted-foreground">
            Top 5 soluções mais implementadas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-chart-md flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">🏆</div>
            <p>Carregando dados de soluções...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Garantir que os dados têm a estrutura correta
  const chartData = data
    .filter(item => (item.value || item.implementations || 0) > 0)
    .map(item => ({
      name: item.name || item.title || 'Solução',
      value: Number(item.value) || Number(item.implementations) || 0
    }))
    .slice(0, 5);

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Soluções Mais Populares</CardTitle>
          <CardDescription className="text-muted-foreground">
            Top 5 soluções mais implementadas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-chart-md flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📝</div>
            <p>Nenhuma implementação encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">Soluções Mais Populares</CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 5 soluções mais implementadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart 
          data={chartData}
          categories={['value']}
          index="name"
          colors={['hsl(var(--aurora-primary))']}
          valueFormatter={(value) => `${value} implementações`}
          className="h-chart-md"
        />
      </CardContent>
    </Card>
  );
};
