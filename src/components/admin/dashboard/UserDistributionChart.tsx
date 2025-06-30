
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface UserDistributionChartProps {
  data: Array<{
    role: string;
    count: number;
  }>;
  loading: boolean;
}

export const UserDistributionChart = ({ data, loading }: UserDistributionChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Processar dados para o gráfico
  const chartData = data.map(item => ({
    name: item.role,
    value: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distribuição de Usuários
        </CardTitle>
        <CardDescription>
          Usuários por tipo de acesso na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <PieChart
              data={chartData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
              className="h-64"
            />
            
            {/* Lista detalhada */}
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.role}</span>
                  <span className="text-muted-foreground">
                    {item.count} usuário{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sem dados de distribuição disponíveis</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
