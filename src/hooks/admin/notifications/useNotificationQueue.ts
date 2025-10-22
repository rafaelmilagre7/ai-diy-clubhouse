import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface NotificationQueueFilters {
  status?: 'pending' | 'sent' | 'failed' | 'cancelled';
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface NotificationQueueItem {
  id: string;
  user_id: string;
  category: string;
  notification_type: string;
  title: string;
  message: string;
  status: string;
  priority: string;
  channels: string[];
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
  is_read: boolean;
  error_message: string | null;
  retry_count: number;
  metadata: any;
  profiles?: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export const useNotificationQueue = (
  filters: NotificationQueueFilters = {},
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: ['admin-notification-queue', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('notification_queue')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            avatar_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar fila de notificações:', error);
        throw error;
      }

      return {
        notifications: (data || []) as NotificationQueueItem[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 30 * 1000, // 30 segundos
  });
};
