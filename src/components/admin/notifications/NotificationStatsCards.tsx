import { AdminCard } from '../ui/AdminCard';
import { Bell, CheckCircle, Clock, XCircle, TrendingUp, Eye } from 'lucide-react';
import { NotificationStats } from '@/hooks/admin/notifications/useNotificationStats';

interface NotificationStatsCardsProps {
  stats: NotificationStats | undefined;
  isLoading: boolean;
}

export const NotificationStatsCards = ({ stats, isLoading }: NotificationStatsCardsProps) => {
  const cards = [
    {
      title: 'Total de Notificações',
      value: stats?.total_notifications || 0,
      icon: Bell,
      description: 'Últimos 30 dias',
      color: 'text-primary',
    },
    {
      title: 'Taxa de Entrega',
      value: `${stats?.delivery_rate || 0}%`,
      icon: TrendingUp,
      description: 'Enviadas com sucesso',
      color: 'text-status-success',
    },
    {
      title: 'Taxa de Leitura',
      value: `${stats?.read_rate || 0}%`,
      icon: Eye,
      description: 'Das notificações enviadas',
      color: 'text-viverblue',
    },
    {
      title: 'Pendentes',
      value: stats?.pending || 0,
      icon: Clock,
      description: 'Aguardando envio',
      color: 'text-status-warning',
    },
    {
      title: 'Falhas (24h)',
      value: stats?.last_24h_failures || 0,
      icon: XCircle,
      description: 'Últimas 24 horas',
      color: 'text-status-error',
    },
    {
      title: 'Tempo Médio',
      value: stats?.avg_delivery_time_seconds 
        ? `${Math.round(stats.avg_delivery_time_seconds)}s`
        : '-',
      icon: CheckCircle,
      description: 'Entrega após criação',
      color: 'text-muted-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AdminCard key={i} variant="default">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-sm"></div>
              <div className="h-8 bg-muted rounded w-1/3 mb-xs"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </AdminCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {cards.map((card) => (
        <AdminCard key={card.title} variant="default" className="hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-xs">{card.title}</p>
              <p className="text-3xl font-bold mb-xs">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
            <div className={`p-sm rounded-lg bg-surface-elevated ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>
      ))}
    </div>
  );
};
