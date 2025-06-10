
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';

interface UserGrowthChartProps {
  data: any[];
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-white">Crescimento de Usuários</CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Novos usuários registrados ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            Sem dados disponíveis para exibição
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-white">Crescimento de Usuários</CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
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
