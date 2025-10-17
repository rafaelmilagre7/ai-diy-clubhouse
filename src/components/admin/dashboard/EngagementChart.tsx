
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart } from "@/components/ui/chart";
import { chartColors } from "@/lib/chart-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EngagementChartProps {
  data: { name: string; value: number }[];
  loading?: boolean;
}

export const EngagementChart = ({ data, loading = false }: EngagementChartProps) => {
  // Transformar os dados para o formato esperado pelo AreaChart
  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        { mes: 'Jan', usuarios: 25 },
        { mes: 'Fev', usuarios: 35 },
        { mes: 'Mar', usuarios: 45 },
        { mes: 'Abr', usuarios: 38 }
      ];
    }
    
    return data.map(item => ({
      mes: item.name || 'N/A',
      usuarios: typeof item.value === 'number' ? item.value : 0
    }));
  }, [data]);

  // Formatter para valores no eixo Y
  const valueFormatter = (value: number) => `${value} usuários`;

  if (loading) {
    return (
      <Card className="overflow-hidden transition-smooth hover:shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
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
          Atividade Mensal
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Engajamento de usuários nos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <AreaChart
            data={formattedData}
            index="mes"
            categories={["usuarios"]}
            colors={[chartColors.primary]}
            valueFormatter={valueFormatter}
            showLegend={false}
            className="h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
