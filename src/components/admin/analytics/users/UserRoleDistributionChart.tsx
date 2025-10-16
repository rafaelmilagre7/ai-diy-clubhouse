
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart';

interface UserRoleDistributionChartProps {
  data: any[];
}

export const UserRoleDistributionChart: React.FC<UserRoleDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Papéis</CardTitle>
          <CardDescription>
            Distribuição de usuários por tipo de papel
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Papéis</CardTitle>
        <CardDescription>
          Distribuição de usuários por tipo de papel
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <PieChart
          data={data}
          index="name"
          category="value"
          colors={['hsl(var(--aurora-primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
