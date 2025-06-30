
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface PopularSolutionsChartProps {
  data: any[];
}

export const PopularSolutionsChart = ({ data }: PopularSolutionsChartProps) => {
  console.log('📊 [POPULAR-SOLUTIONS] Dados recebidos:', data);

  // Validação mais flexível dos dados
  const hasValidData = data && Array.isArray(data) && data.length > 0;
  
  if (!hasValidData) {
    console.log('📊 [POPULAR-SOLUTIONS] Sem dados válidos, exibindo placeholder');
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Soluções Mais Populares</CardTitle>
          <CardDescription className="text-muted-foreground">
            Top 5 soluções mais implementadas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
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

  console.log('📊 [POPULAR-SOLUTIONS] Dados formatados para gráfico:', chartData);

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Soluções Mais Populares</CardTitle>
          <CardDescription className="text-muted-foreground">
            Top 5 soluções mais implementadas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
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
          colors={['#0ABAB5']}
          valueFormatter={(value) => `${value} implementações`}
          className="h-[300px]"
        />
      </CardContent>
    </Card>
  );
};
