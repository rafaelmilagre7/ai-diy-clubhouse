
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
    <div className="aurora-glass rounded-xl aurora-hover-scale">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold aurora-text-gradient">
            Distribuição de Usuários
          </h3>
        </div>
        <p className="text-muted-foreground">
          Usuários por tipo de acesso na plataforma
        </p>
      </div>
      
      <div className="p-6">
        {chartData.length > 0 ? (
          <div className="space-y-6">
            <div className="aurora-glass rounded-lg p-4">
              <PieChart
                data={chartData}
                category="value"
                index="name"
                valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
                className="h-64"
              />
            </div>
            
            {/* Lista detalhada com Aurora Style */}
            <div className="space-y-3">
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className="aurora-glass rounded-lg p-3 flex items-center justify-between hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary aurora-glow"></div>
                    <span className="font-semibold text-foreground">{item.role}</span>
                  </div>
                  <span className="aurora-text-gradient font-bold">
                    {item.count} usuário{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="aurora-glass rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Sem dados disponíveis</h4>
              <p className="text-muted-foreground text-sm">
                Aguarde o carregamento dos dados de distribuição
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
