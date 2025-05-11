
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';

interface UserGrowthChartProps {
  data: any[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Usuários</CardTitle>
          <CardDescription>
            Evolução do número de usuários ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Usuários</CardTitle>
        <CardDescription>
          Evolução do número de usuários ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <AreaChart
          data={data}
          index="date"
          categories={['novos', 'total']}
          colors={['#3B82F6', '#0ABAB5']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
