
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";

interface CompletionRateChartProps {
  data: { name: string; completion: number }[];
}

export const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  // Transformar os dados para o formato esperado pelo BarChart
  const formattedData = useMemo(() => {
    return data.map(item => ({
      solucao: item.name,
      conclusao: item.completion
    }));
  }, [data]);

  // Formatador de valores para o eixo Y
  const valueFormatter = (value: number) => `${value}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Conclusão por Solução</CardTitle>
        <CardDescription>
          Percentual de implementações concluídas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <BarChart
            data={formattedData}
            index="solucao"
            categories={["conclusao"]}
            colors={["#0ABAB5"]}
            valueFormatter={valueFormatter}
            yAxisWidth={50}
          />
        </div>
      </CardContent>
    </Card>
  );
};
