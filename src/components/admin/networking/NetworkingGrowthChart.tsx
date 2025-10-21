import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export const NetworkingGrowthChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['networking-growth-chart'],
    queryFn: async () => {
      const { data: metrics } = await supabase
        .from('networking_metrics')
        .select('*')
        .order('month', { ascending: true })
        .limit(6);

      if (!metrics || metrics.length === 0) {
        // Dados mockados para demonstração
        return [
          { month: 'Jan', matches: 12, connections: 8, users: 45 },
          { month: 'Fev', matches: 19, connections: 15, users: 62 },
          { month: 'Mar', matches: 28, connections: 22, users: 78 },
          { month: 'Abr', matches: 35, connections: 28, users: 95 },
          { month: 'Mai', matches: 42, connections: 35, users: 112 },
          { month: 'Jun', matches: 51, connections: 43, users: 128 },
        ];
      }

      return metrics.map(m => ({
        month: new Date(m.month).toLocaleDateString('pt-BR', { month: 'short' }),
        matches: m.total_matches || 0,
        connections: m.active_connections || 0,
        users: m.new_users || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Crescimento de Networking
        </CardTitle>
        <CardDescription>
          Evolução de matches, conexões e novos usuários nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="matches" 
                stroke="hsl(var(--primary))" 
                name="Matches"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="connections" 
                stroke="hsl(var(--chart-2))" 
                name="Conexões"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--chart-3))" 
                name="Novos Usuários"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
