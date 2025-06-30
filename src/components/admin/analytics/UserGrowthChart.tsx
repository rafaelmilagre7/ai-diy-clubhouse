
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';

interface UserGrowthChartProps {
  data: any[];
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Crescimento de Usuários</CardTitle>
          <CardDescription className="text-muted-foreground">
            Novos usuários registrados ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Sem dados disponíveis para exibição
          </p>
        </CardContent>
      </Card>
    );
  }

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
          data={data}
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
