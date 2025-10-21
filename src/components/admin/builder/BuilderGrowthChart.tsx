import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BuilderGrowthChartProps {
  analytics: any[];
  loading: boolean;
}

export const BuilderGrowthChart: React.FC<BuilderGrowthChartProps> = ({
  analytics,
  loading
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Soluções</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = analytics?.map(item => ({
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
    soluções: item.solutions_generated || 0,
    usuários: item.unique_users || 0
  })).reverse() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Soluções</CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimos 30 dias
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="soluções" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                type="monotone" 
                dataKey="usuários" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
};
