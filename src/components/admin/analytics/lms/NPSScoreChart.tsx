
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart/pie-chart';
import { Skeleton } from '@/components/ui/skeleton';

interface NPSScoreChartProps {
  npsData: {
    overall: number;
    distribution: {
      promoters: number;
      neutrals: number;
      detractors: number;
    };
  };
  isLoading: boolean;
}

export const NPSScoreChart: React.FC<NPSScoreChartProps> = ({ npsData, isLoading }) => {
  // Função para determinar a cor do texto baseado no score NPS
  const npsScoreColorClass = () => {
    if (npsData.overall >= 50) return "text-green-500";
    if (npsData.overall >= 0) return "text-amber-500";
    return "text-red-500";
  };
  
  // Status baseado no NPS
  const getNpsStatus = (score: number) => {
    if (score >= 50) return "Excelente";
    if (score >= 30) return "Bom";
    if (score >= 0) return "Aceitável";
    if (score >= -20) return "Precisa de atenção";
    return "Crítico";
  };
  
  // Transformar dados para o formato do gráfico
  const chartData = [
    { name: 'Promotores', value: npsData.distribution.promoters || 0 },
    { name: 'Neutros', value: npsData.distribution.neutrals || 0 },
    { name: 'Detratores', value: npsData.distribution.detractors || 0 }
  ];
  
  // Cores para o gráfico de pizza
  const chartColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  // Verificar se temos valores válidos antes de renderizar o gráfico
  const hasValidData = chartData.some(item => item.value > 0);
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Score NPS - Distribuição</CardTitle>
        <CardDescription className="flex items-center gap-2">
          NPS geral: {isLoading ? (
            <Skeleton className="h-5 w-14 inline-block" />
          ) : (
            <>
              <span className={`font-bold ${npsScoreColorClass()}`}>{npsData.overall}</span>
              <span className="text-sm text-muted-foreground">
                ({getNpsStatus(npsData.overall)})
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        ) : !hasValidData ? (
          <div className="h-full w-full flex items-center justify-center flex-col text-center p-4">
            <p className="text-muted-foreground mb-2">Sem dados suficientes para gerar gráfico</p>
            <p className="text-sm text-muted-foreground">
              As informações de NPS são baseadas nas avaliações dos alunos após completarem as aulas
            </p>
          </div>
        ) : (
          <PieChart
            data={chartData}
            category="value"
            index="name"
            colors={chartColors}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            className="mx-auto"
          />
        )}
      </CardContent>
    </Card>
  );
};
