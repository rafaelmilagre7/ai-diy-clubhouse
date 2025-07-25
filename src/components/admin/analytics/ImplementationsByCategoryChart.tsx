
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface ImplementationsByCategoryChartProps {
  data: any[];
}

export const ImplementationsByCategoryChart = ({ data }: ImplementationsByCategoryChartProps) => {
  console.log('📊 [IMPLEMENTATIONS-CATEGORY] Dados recebidos:', data);

  // Validação mais flexível dos dados
  const hasValidData = data && Array.isArray(data) && data.length > 0;
  
  if (!hasValidData) {
    console.log('📊 [IMPLEMENTATIONS-CATEGORY] Sem dados válidos, exibindo placeholder');
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Implementações por Categoria</CardTitle>
          <CardDescription className="text-muted-foreground">
            Distribuição por tipo de solução
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📊</div>
            <p>Carregando dados de categorias...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Garantir que os dados têm a estrutura correta
  const chartData = data
    .filter(item => (item.value || item.count || 0) > 0)
    .map(item => ({
      name: item.name || item.category || 'Categoria',
      value: Number(item.value) || Number(item.count) || 0
    }));

  console.log('📊 [IMPLEMENTATIONS-CATEGORY] Dados formatados para gráfico:', chartData);

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Implementações por Categoria</CardTitle>
          <CardDescription className="text-muted-foreground">
            Distribuição por tipo de solução
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📂</div>
            <p>Nenhuma categoria encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">Implementações por Categoria</CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribuição por tipo de solução
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PieChart 
          data={chartData}
          category="value"
          index="name"
          valueFormatter={(value) => `${value} implementações`}
          colors={['#0ABAB5', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B']}
          className="h-[200px]"
        />
      </CardContent>
    </Card>
  );
};
