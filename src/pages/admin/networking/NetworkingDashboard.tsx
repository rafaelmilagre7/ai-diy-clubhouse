import { Network, TrendingUp } from 'lucide-react';
import { useAdminOpportunitiesMetrics } from '@/hooks/admin/useAdminOpportunities';
import { NetworkingMetricsCards } from '@/components/admin/networking/NetworkingMetricsCards';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const NetworkingDashboard = () => {
  const { data: metrics, isLoading } = useAdminOpportunitiesMetrics();

  // Preparar dados para o gráfico de barras (por tipo)
  const typeChartData = metrics?.byType
    ? Object.entries(metrics.byType).map(([type, count]) => ({
        name: type === 'parceria' ? 'Parceria' :
              type === 'fornecedor' ? 'Fornecedor' :
              type === 'cliente' ? 'Cliente' :
              type === 'investimento' ? 'Investimento' : 'Outro',
        value: count,
      }))
    : [];

  // Preparar dados para o gráfico de linha (timeline)
  const timelineChartData = metrics?.timeline
    ? Object.entries(metrics.timeline)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          count,
        }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-aurora to-viverblue">
            <Network className="w-6 h-6 text-white" />
          </div>
          Networking & Oportunidades
        </h1>
        <p className="text-muted-foreground">
          Visão geral das oportunidades de negócio compartilhadas na plataforma
        </p>
      </div>

      {/* Metrics Cards */}
      <NetworkingMetricsCards
        metrics={{
          total: metrics?.total || 0,
          active: metrics?.active || 0,
          thisWeek: metrics?.thisWeek || 0,
          totalViews: metrics?.totalViews || 0,
          edited: metrics?.edited || 0,
          deleted: metrics?.deleted || 0,
        }}
        loading={isLoading}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Oportunidades por Tipo */}
        <Card className="liquid-glass-card p-6 border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-aurora" />
            Oportunidades por Tipo
          </h3>
          {typeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--aurora))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--viverblue))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados disponíveis
            </div>
          )}
        </Card>

        {/* Chart: Timeline */}
        <Card className="liquid-glass-card p-6 border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-viverblue" />
            Criação nos Últimos 30 Dias
          </h3>
          {timelineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--viverblue))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--aurora))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados disponíveis
            </div>
          )}
        </Card>
      </div>

      {/* Top Tags (if available) */}
      {/* TODO: Adicionar análise de tags mais usadas */}
    </div>
  );
};

export default NetworkingDashboard;
