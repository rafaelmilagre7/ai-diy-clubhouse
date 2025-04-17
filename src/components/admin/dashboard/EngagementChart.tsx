
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart } from "@/components/ui/chart";

interface EngagementChartProps {
  data: { name: string; value: number }[];
}

export const EngagementChart = ({ data }: EngagementChartProps) => {
  // Transformar os dados para o formato esperado pelo AreaChart
  const formattedData = useMemo(() => {
    return data.map(item => ({
      month: item.name,
      atividade: item.value
    }));
  }, [data]);

  // Formatador de valores para o eixo Y
  const valueFormatter = (value: number) => `${value.toLocaleString('pt-BR')} usuários`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Mensal</CardTitle>
        <CardDescription>
          Engajamento de usuários nos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <AreaChart
            data={formattedData}
            index="month"
            categories={["atividade"]}
            colors={["#0ABAB5"]}
            valueFormatter={valueFormatter}
            yAxisWidth={70}
          />
        </div>
      </CardContent>
    </Card>
  );
};
