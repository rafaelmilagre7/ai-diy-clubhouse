
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';

interface UserGrowthChartProps {
  data: any[];
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  console.log('📊 [USER-GROWTH] Dados recebidos:', data);

  // Validação mais flexível dos dados
  const hasValidData = data && Array.isArray(data) && data.length > 0;
  
  if (!hasValidData) {
    console.log('📊 [USER-GROWTH] Sem dados válidos, exibindo placeholder');
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Crescimento de Usuários</CardTitle>
          <CardDescription className="text-muted-foreground">
            Novos usuários registrados ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📈</div>
            <p>Carregando dados de crescimento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Garantir que os dados têm a estrutura correta
  const chartData = data.map(item => ({
    name: item.name || item.date || 'Data',
    novos: Number(item.novos) || Number(item.users) || 0,
    total: Number(item.total) || 0
  }));

  console.log('📊 [USER-GROWTH] Dados formatados para gráfico:', chartData.slice(0, 3));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">Crescimento de Usuários</CardTitle>
        <CardDescription className="text-muted-foreground">
          Novos usuários registrados ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AreaChart 
          data={chartData}
          categories={['novos', 'total']}
          index="name"
          colors={['#3B82F6', '#0ABAB5']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          className="h-[300px]"
        />
      </CardContent>
    </Card>
  );
};
