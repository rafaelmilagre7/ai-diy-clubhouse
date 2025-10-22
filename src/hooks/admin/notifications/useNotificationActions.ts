import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const resendNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.rpc('resend_notification', {
        p_notification_id: notificationId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Sucesso',
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
      } else {
        toast({
          title: 'Erro',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao reenviar notificação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.rpc('cancel_notification', {
        p_notification_id: notificationId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Sucesso',
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
      } else {
        toast({
          title: 'Erro',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar notificação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendTestNotification = useMutation({
    mutationFn: async (params: {
      userId: string;
      category: string;
      notificationType: string;
      title: string;
      message: string;
      priority?: string;
      channels?: string[];
    }) => {
      const { data, error } = await supabase.rpc('send_test_notification', {
        p_user_id: params.userId,
        p_category: params.category,
        p_notification_type: params.notificationType,
        p_title: params.title,
        p_message: params.message,
        p_priority: params.priority || 'normal',
        p_channels: params.channels || ['in_app'],
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Notificação de teste enviada',
          description: 'A notificação foi criada e será processada em breve.',
        });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar notificação de teste',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkResend = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const results = await Promise.allSettled(
        notificationIds.map((id) =>
          supabase.rpc('resend_notification', { p_notification_id: id })
        )
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      return { successful, failed, total: notificationIds.length };
    },
    onSuccess: (data) => {
      toast({
        title: 'Reenvio em massa concluído',
        description: `${data.successful} de ${data.total} notificações reagendadas.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no reenvio em massa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    resendNotification,
    cancelNotification,
    sendTestNotification,
    bulkResend,
  };
};
