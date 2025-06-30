
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';

interface WeeklyActivityChartProps {
  data: any[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Atividade Semanal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Atividade dos usuários por dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
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
        <CardTitle className="text-lg font-semibold text-card-foreground">Atividade Semanal</CardTitle>
        <CardDescription className="text-muted-foreground">
          Atividade dos usuários por dia da semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart 
          data={data}
          categories={['atividade']}
          index="day"
          colors={['#0ABAB5']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          className="h-[200px]"
        />
      </CardContent>
    </Card>
  );
};
