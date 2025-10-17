
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
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        { solucao: 'Assistente WhatsApp', conclusao: 85 },
        { solucao: 'Automação Email', conclusao: 72 },
        { solucao: 'Chatbot Website', conclusao: 90 },
        { solucao: 'IA Atendimento', conclusao: 68 }
      ];
    }
    
    return data.map(item => ({
      solucao: item.name && item.name.length > 20 
        ? `${item.name.substring(0, 20)}...` 
        : item.name || "Desconhecido",
      conclusao: typeof item.completion === 'number' ? item.completion : 0
    }));
  }, [data]);

  // Formatador de valores para o eixo Y
  const valueFormatter = (value: number) => `${value}%`;

  if (loading) {
    return (
      <Card className="overflow-hidden transition-smooth hover:shadow-md">
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
    <Card className="overflow-hidden transition-smooth bg-card backdrop-blur-sm hover:shadow-md border border-border">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-operational bg-clip-text text-transparent">
          Taxa de Conclusão por Solução
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Percentual de implementações concluídas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
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
        </div>
      </CardContent>
    </Card>
  );
};
