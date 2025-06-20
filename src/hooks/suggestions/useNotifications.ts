
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { NotificationType } from '@/types/suggestionTypes';

export const useNotifications = () => {
  const { user } = useAuth();
  
  const {
    data: notifications = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['suggestion-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('suggestion_notifications')
        .select(`
          *,
          suggestion:suggestion_id(title),
          comment:comment_id(content),
          profiles:user_id(name, avatar_url)
        `)
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user
  });

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('suggestion_notifications')
        .update({ is_read: true } as any)
        .eq('id', notificationId as any);

      if (error) throw error;

      refetch();
    } catch (error: any) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('suggestion_notifications')
        .update({ is_read: true } as any)
        .eq('user_id', user.id as any)
        .eq('is_read', false as any);

      if (error) throw error;

      refetch();
    } catch (error: any) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      throw error;
    }
  };

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  };
};
