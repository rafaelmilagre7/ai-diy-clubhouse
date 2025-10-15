import { Network, TrendingUp, Eye, CheckCircle } from 'lucide-react';
import { AdminStats } from '@/components/admin/ui/AdminStats';

interface NetworkingMetricsCardsProps {
  metrics: {
    total: number;
    active: number;
    thisWeek: number;
    totalViews: number;
    edited?: number;
    deleted?: number;
  };
  loading?: boolean;
}

export const NetworkingMetricsCards = ({ metrics, loading }: NetworkingMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <AdminStats
        title="Total de Oportunidades"
        value={metrics.total}
        icon={<Network className="w-5 h-5" />}
        loading={loading}
        variant="default"
      />
      
      <AdminStats
        title="Oportunidades Ativas"
        value={metrics.active}
        icon={<CheckCircle className="w-5 h-5" />}
        loading={loading}
        variant="success"
      />
      
      <AdminStats
        title="Criadas esta Semana"
        value={metrics.thisWeek}
        icon={<TrendingUp className="w-5 h-5" />}
        loading={loading}
        variant="info"
        change={{
          value: metrics.thisWeek,
          period: 'últimos 7 dias',
          trend: metrics.thisWeek > 0 ? 'up' : 'neutral',
        }}
      />
      
      <AdminStats
        title="Total de Visualizações"
        value={metrics.totalViews}
        icon={<Eye className="w-5 h-5" />}
        loading={loading}
        variant="warning"
      />

      <AdminStats
        title="Oportunidades Editadas"
        value={metrics.edited || 0}
        icon={<TrendingUp className="w-5 h-5" />}
        loading={loading}
        variant="info"
      />
    </div>
  );
};
