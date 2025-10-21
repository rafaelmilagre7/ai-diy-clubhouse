
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { devLog } from '@/utils/devLogger';

interface WeeklyActivityChartProps {
  data: any[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  devLog.data('Dados recebidos:', data);

  // Validação mais flexível dos dados
  const hasValidData = data && Array.isArray(data) && data.length > 0;
  
  if (!hasValidData) {
    devLog.data('Sem dados válidos, exibindo placeholder');
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">Atividade Semanal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Atividade dos usuários por dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent className="h-chart-sm flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📅</div>
            <p>Carregando dados de atividade...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Garantir que os dados têm a estrutura correta
  const chartData = data.map(item => ({
    day: item.day || item.day_name || 'Dia',
    atividade: Number(item.atividade) || Number(item.activity) || Number(item.activity_count) || 0
  }));

  devLog.data('Dados formatados para gráfico:', chartData);

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
          data={chartData}
          categories={['atividade']}
          index="day"
          colors={['hsl(var(--aurora-primary))']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          className="h-chart-sm"
        />
      </CardContent>
    </Card>
  );
};
