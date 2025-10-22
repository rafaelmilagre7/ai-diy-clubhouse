import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface NotificationStats {
  total_notifications: number;
  sent: number;
  pending: number;
  failed: number;
  cancelled: number;
  delivery_rate: number;
  read_rate: number;
  avg_delivery_time_seconds: number;
  last_24h_failures: number;
}

export interface NotificationTrend {
  date: string;
  category: string;
  notification_type: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  read_count: number;
  avg_delivery_seconds: number;
}

export const useNotificationStats = (days: number = 30) => {
  return useQuery({
    queryKey: ['admin-notification-stats', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_notification_system_stats', {
        p_days: days,
      });

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      return data as NotificationStats;
    },
    staleTime: 60 * 1000, // 1 minuto
  });
};

export const useNotificationTrends = (days: number = 30) => {
  return useQuery({
    queryKey: ['admin-notification-trends', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('admin_notification_stats')
        .select('*')
        .gte('date', fromDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tendências:', error);
        throw error;
      }

      return (data || []) as NotificationTrend[];
    },
    staleTime: 60 * 1000, // 1 minuto
  });
};

export const useNotificationsByCategory = (days: number = 30) => {
  return useQuery({
    queryKey: ['admin-notifications-by-category', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('notification_queue')
        .select('category, status')
        .gte('created_at', fromDate.toISOString());

      if (error) {
        console.error('Erro ao buscar notificações por categoria:', error);
        throw error;
      }

      // Agregar por categoria
      const categoryStats = (data || []).reduce((acc: any, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = { category: item.category, total: 0, sent: 0, failed: 0, pending: 0 };
        }
        acc[item.category].total++;
        if (item.status === 'sent') acc[item.category].sent++;
        if (item.status === 'failed') acc[item.category].failed++;
        if (item.status === 'pending') acc[item.category].pending++;
        return acc;
      }, {});

      return Object.values(categoryStats);
    },
    staleTime: 60 * 1000, // 1 minuto
  });
};
