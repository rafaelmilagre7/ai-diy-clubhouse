import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageCircle, 
  Calendar,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkingAnalytics } from '@/hooks/useNetworkingAnalytics';
import LoadingScreen from '@/components/common/LoadingScreen';
import { AreaChart, BarChart } from '@/components/ui/chart';

export const NetworkingAnalytics = () => {
  const { metrics, stats, recentEvents, isLoading } = useNetworkingAnalytics();

  if (isLoading) {
    return <LoadingScreen message="Carregando analytics..." />;
  }

  const statCards = [
    {
      title: 'Matches Gerados',
      value: stats.totalMatches,
      growth: stats.matchesGrowth,
      icon: Target,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      title: 'Conexões Ativas',
      value: stats.totalConnections,
      growth: stats.connectionsGrowth,
      icon: Users,
      color: 'text-operational',
      bgColor: 'bg-operational/10'
    },
    {
      title: 'Mensagens Enviadas',
      value: stats.totalMessages,
      growth: 0,
      icon: MessageCircle,
      color: 'text-aurora-primary',
      bgColor: 'bg-aurora-primary/10'
    },
    {
      title: 'Reuniões Agendadas',
      value: stats.totalMeetings,
      growth: 0,
      icon: Calendar,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  const chartData = metrics?.slice(0, 6).reverse().map(metric => ({
    month: metric.metric_month,
    matches: metric.total_matches,
    connections: metric.active_connections,
    messages: 0 // Não disponível na estrutura atual da tabela
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">Analytics de Networking</h2>
          <p className="text-sm text-textSecondary">
            Acompanhe seu desempenho e evolução no networking
          </p>
        </div>
        <Badge variant="default" className="bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30">
          <BarChart3 className="h-3 w-3 mr-1" />
          Métricas Avançadas
        </Badge>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositiveGrowth = stat.growth > 0;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    {stat.growth !== 0 && (
                      <div className={`flex items-center gap-1 text-xs ${
                        isPositiveGrowth ? 'text-system-healthy' : 'text-status-error'
                      }`}>
                        {isPositiveGrowth ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(stat.growth).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-400">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução Temporal */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-white">Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <AreaChart
                data={chartData}
                index="month"
                categories={["matches", "connections"]}
                colors={["hsl(var(--info))", "hsl(var(--operational))"]}
                valueFormatter={(value) => value.toString()}
                className="h-72"
              />
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Dados insuficientes para gráfico</p>
                  <p className="text-xs">Continue fazendo networking!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Indicators */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-white">Indicadores de Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">Taxa de Sucesso</span>
                  <span className="text-white">{stats.successRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-operational h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.successRate, 100)}%` }}
                  />
                </div>
              </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">Compatibilidade Média</span>
                    <span className="text-white">{stats.avgCompatibility.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-aurora-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.avgCompatibility}%` }}
                    />
                  </div>
                </div>

              <div className="pt-2 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Resumo do Mês</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Matches → Conexões</span>
                    <span className="text-operational">
                      {stats.totalConnections}/{stats.totalMatches}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Conversas Ativas</span>
                    <span className="text-aurora-primary">{stats.totalMessages} msgs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Reuniões Marcadas</span>
                    <span className="text-warning">{stats.totalMeetings}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-white">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recentEvents.slice(0, 10).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-2 h-2 bg-aurora-primary rounded-full flex-shrink-0" />
                  <span className="text-foreground flex-1">
                    {getEventDescription(event)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(event.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-xs">Comece a fazer networking para ver suas métricas!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function getEventDescription(event: any): string {
  const descriptions = {
    'match_generated': 'Novo match IA gerado',
    'connection_sent': 'Solicitação de conexão enviada',
    'connection_accepted': 'Conexão aceita',
    'message_sent': 'Mensagem enviada',
    'meeting_scheduled': 'Reunião agendada'
  };
  
  return descriptions[event.event_type] || event.event_type;
}