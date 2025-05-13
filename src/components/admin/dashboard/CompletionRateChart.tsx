
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { chartColors } from "@/lib/chart-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CompletionRateChartProps {
  data: { name: string; completion: number }[];
  loading?: boolean;
}

export const CompletionRateChart = ({ data, loading = false }: CompletionRateChartProps) => {
  // Transformar os dados para o formato esperado pelo BarChart
  const formattedData = useMemo(() => {
    return data.map(item => ({
      solucao: item.name && item.name.length > 20 
        ? `${item.name.substring(0, 20)}...` 
        : item.name || "Desconhecido",
      conclusao: item.completion
    }));
  }, [data]);

  // Formatador de valores para o eixo Y
  const valueFormatter = (value: number) => `${value}%`;
  
  // Determinar cores com base nas taxas de conclusão
  const getBarColor = (completion: number) => {
    if (completion >= 75) return chartColors.success;
    if (completion >= 50) return chartColors.primary;
    if (completion >= 25) return chartColors.info;
    return chartColors.warning;
  };
  
  // Cores customizadas baseadas nas taxas de conclusão
  const customColors = data.map(item => getBarColor(item.completion));

  if (loading) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-md border border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Taxa de Conclusão por Solução
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Percentual de implementações concluídas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          {data.length > 0 ? (
            <BarChart
              data={formattedData}
              index="solucao"
              categories={["conclusao"]}
              colors={[chartColors.primary]}
              valueFormatter={valueFormatter}
              showLegend={false}
              layout={formattedData.length > 5 ? "vertical" : "horizontal"}
              className="h-full"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Sem dados suficientes para mostrar taxas de conclusão
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
