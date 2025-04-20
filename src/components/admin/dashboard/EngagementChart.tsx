
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
      mes: item.name,
      usuarios: item.value
    }));
  }, [data]);

  // Formatter para valores no eixo Y
  const valueFormatter = (value: number) => `${value} usuários`;

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
            index="mes"
            categories={["usuarios"]}
            colors={["#0ABAB5"]}
            valueFormatter={valueFormatter}
            yAxisWidth={60}
            showAnimation={true}
            showLegend={false}
            curveType="monotone"
          />
        </div>
      </CardContent>
    </Card>
  );
};
