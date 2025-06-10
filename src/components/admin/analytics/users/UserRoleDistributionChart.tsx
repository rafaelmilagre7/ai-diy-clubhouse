
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { chartColors } from '@/lib/chart-utils';

interface UserRoleDistributionChartProps {
  data: any[];
  isLoading?: boolean;
}

export const UserRoleDistributionChart: React.FC<UserRoleDistributionChartProps> = ({ 
  data, 
  isLoading = false 
}) => {
  // Palette de cores específica para papéis de usuários
  const roleColors = [
    chartColors.primary, // Admin
    chartColors.secondary,  // Member
    chartColors.success, // Formação
    chartColors.info,    // Outros papéis
  ];
  
  // Formatar valor para exibição
  const valueFormatter = (value: number) => `${value} usuário${value !== 1 ? 's' : ''}`;

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-md border border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Distribuição por Perfil
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Usuários por tipo de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-6">
        {!data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          </div>
        ) : (
          <PieChart
            data={data}
            index="name"
            category="value"
            colors={roleColors}
            valueFormatter={valueFormatter}
            className="h-full"
          />
        )}
      </CardContent>
    </Card>
  );
};
