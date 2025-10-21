import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MousePointerClick,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function EmailDashboard() {
  useDocumentTitle("Dashboard de Emails | Admin");

  // Buscar estatísticas gerais
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      const today = new Date();
      const weekAgo = subDays(today, 7);
      const monthAgo = subDays(today, 30);

      // Total de convites
      const { count: totalInvites } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true });

      // Convites de hoje
      const { count: todayInvites } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString().split('T')[0]);

      // Eventos de entrega
      const { data: events } = await supabase
        .from('invite_delivery_events')
        .select('event_type, created_at')
        .gte('created_at', monthAgo.toISOString());

      // Estatísticas por tipo de evento
      const eventStats = events?.reduce((acc: any, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

      // Taxa de entrega
      const sent = eventStats['sent'] || 0;
      const delivered = eventStats['delivered'] || 0;
      const opened = eventStats['opened'] || 0;
      const clicked = eventStats['clicked'] || 0;
      const bounced = eventStats['bounced'] || 0;
      const failed = eventStats['delivery_delayed'] || 0;

      return {
        total: totalInvites || 0,
        today: todayInvites || 0,
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0',
        openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0',
        clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0',
        bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(1) : '0',
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30s
  });

  // Buscar dados do gráfico de tendência
  const { data: trendData } = useQuery({
    queryKey: ['email-trend'],
    queryFn: async () => {
      const days = 7;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const { count } = await supabase
          .from('invite_delivery_events')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`);
        
        data.push({
          date: format(date, 'dd/MM', { locale: ptBR }),
          emails: count || 0
        });
      }
      
      return data;
    },
  });

  // Distribuição de status
  const statusData = stats ? [
    { name: 'Entregues', value: stats.delivered, color: COLORS[0] },
    { name: 'Pendentes', value: stats.sent - stats.delivered, color: COLORS[1] },
    { name: 'Falhos', value: stats.failed, color: COLORS[2] },
    { name: 'Bounce', value: stats.bounced, color: COLORS[3] },
  ].filter(item => item.value > 0) : [];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora/5 p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora/5 p-6 space-y-8">
      {/* Header */}
      <div className="aurora-glass rounded-2xl p-8 border border-aurora/20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-16 bg-gradient-to-b from-aurora via-aurora-primary to-operational rounded-full aurora-glow"></div>
          <div>
            <h1 className="text-4xl font-bold aurora-text-gradient">Dashboard de Emails</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Monitore todas as métricas de email da plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="aurora-glass border-aurora/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
            <Send className="h-4 w-4 text-aurora" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aurora">{stats?.sent || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.today || 0} hoje
            </p>
          </CardContent>
        </Card>

        <Card className="aurora-glass border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats?.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.delivered || 0} entregues
            </p>
          </CardContent>
        </Card>

        <Card className="aurora-glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats?.openRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.opened || 0} abertos
            </p>
          </CardContent>
        </Card>

        <Card className="aurora-glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
            <MousePointerClick className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats?.clickRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.clicked || 0} cliques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Tendência */}
        <Card className="aurora-glass border-aurora/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-aurora" />
              <CardTitle>Tendência de Envios (7 dias)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {trendData ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emails" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[250px]" />
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Status */}
        <Card className="aurora-glass border-aurora/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-aurora" />
              <CardTitle>Distribuição de Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="60%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ background: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(stats?.bounceRate && parseFloat(stats.bounceRate) > 5) && (
        <Card className="aurora-glass border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-500">Taxa de Bounce Elevada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A taxa de bounce está em {stats.bounceRate}%, o que pode indicar problemas com a qualidade dos endereços de email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
