
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { chartColors } from '@/lib/chart-utils';

interface CompletionRatesChartProps {
  data: any[];
  isLoading?: boolean;
}

export const CompletionRatesChart: React.FC<CompletionRatesChartProps> = ({ 
  data, 
  isLoading = false 
}) => {
  // Formatar os nomes das soluções para exibição
  const formattedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      ...item,
      name: item.name && item.name.length > 20 
        ? `${item.name.substring(0, 20)}...` 
        : item.name || "Desconhecido"
    }));
  }, [data]);

  // Formatação de valores para o eixo Y
  const valueFormatter = (value: number) => `${value}%`;
  
  // Escolher uma gradiente de cores baseada no valor
  const getColors = () => {
    return [chartColors.primary, chartColors.secondary, chartColors.success];
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="h-chart-md">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 bg-card backdrop-blur-sm hover:shadow-md border border-border">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-operational bg-clip-text text-transparent">
          Taxas de Conclusão
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 5 soluções com maiores taxas de conclusão
        </CardDescription>
      </CardHeader>
      <CardContent className="h-chart-md pt-6">
        {!data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          </div>
        ) : (
          <BarChart
            data={formattedData}
            index="name"
            categories={['value']}
            colors={getColors()}
            valueFormatter={valueFormatter}
            layout={formattedData.length > 5 ? "vertical" : "horizontal"}
            className="h-full"
          />
        )}
      </CardContent>
    </Card>
  );
};
