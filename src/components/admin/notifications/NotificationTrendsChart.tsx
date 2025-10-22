import { AdminCard } from '../ui/AdminCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NotificationTrend } from '@/hooks/admin/notifications/useNotificationStats';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationTrendsChartProps {
  trends: NotificationTrend[] | undefined;
  isLoading: boolean;
}

export const NotificationTrendsChart = ({ trends, isLoading }: NotificationTrendsChartProps) => {
  if (isLoading) {
    return (
      <AdminCard>
        <h3 className="text-lg font-semibold mb-md">Tendências de Notificações</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
        </div>
      </AdminCard>
    );
  }

  // Agregar dados por data (somar todas as categorias)
  const aggregatedData = trends?.reduce((acc: any[], trend) => {
    const existingDate = acc.find((item) => item.date === trend.date);
    
    if (existingDate) {
      existingDate.total += trend.total;
      existingDate.sent += trend.sent;
      existingDate.failed += trend.failed;
      existingDate.pending += trend.pending;
    } else {
      acc.push({
        date: trend.date,
        total: trend.total,
        sent: trend.sent,
        failed: trend.failed,
        pending: trend.pending,
      });
    }
    
    return acc;
  }, []) || [];

  // Formatar dados para o gráfico
  const chartData = aggregatedData.map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <AdminCard>
      <h3 className="text-lg font-semibold mb-md">Tendências de Notificações (Últimos 30 dias)</h3>
      
      {chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="dateFormatted" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--surface-elevated))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Total"
            />
            <Line 
              type="monotone" 
              dataKey="sent" 
              stroke="hsl(var(--status-success))" 
              strokeWidth={2}
              name="Enviadas"
            />
            <Line 
              type="monotone" 
              dataKey="failed" 
              stroke="hsl(var(--status-error))" 
              strokeWidth={2}
              name="Falhas"
            />
            <Line 
              type="monotone" 
              dataKey="pending" 
              stroke="hsl(var(--status-warning))" 
              strokeWidth={2}
              name="Pendentes"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </AdminCard>
  );
};
