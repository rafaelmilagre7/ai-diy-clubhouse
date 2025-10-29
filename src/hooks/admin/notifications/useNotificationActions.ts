import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToastModern } from '@/hooks/useToastModern';

export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastModern();

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
        showSuccess('Sucesso', data.message);
        queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
      } else {
        showError('Erro', data.message);
      }
    },
    onError: (error: any) => {
      showError('Erro ao reenviar notificação', error.message);
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
        showSuccess('Sucesso', data.message);
        queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
        queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
      } else {
        showError('Erro', data.message);
      }
    },
    onError: (error: any) => {
      showError('Erro ao cancelar notificação', error.message);
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
        showSuccess('Notificação de teste enviada', 'A notificação foi criada e será processada em breve.');
        queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
      }
    },
    onError: (error: any) => {
      showError('Erro ao enviar notificação de teste', error.message);
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
      showSuccess('Reenvio em massa concluído', `${data.successful} de ${data.total} notificações reagendadas.`);
      queryClient.invalidateQueries({ queryKey: ['admin-notification-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
    },
    onError: (error: any) => {
      showError('Erro no reenvio em massa', error.message);
    },
  });

  return {
    resendNotification,
    cancelNotification,
    sendTestNotification,
    bulkResend,
  };
};
