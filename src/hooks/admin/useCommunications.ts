
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  showModernSuccess,
  showModernError,
  showModernLoading,
  showModernSuccessWithAction,
  dismissModernToast,
  showModernWarning
} from '@/lib/toast-helpers';

export interface AdminCommunication {
  id: string;
  title: string;
  content: string;
  email_subject?: string;
  template_type: string;
  priority: string;
  target_roles: string[];
  delivery_channels: string[];
  status: string;
  scheduled_for?: string;
  created_at: string;
  sent_at?: string;
  created_by: string;
}

export interface Role {
  id: string;
  name: string;
}

export const useCommunications = () => {
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['admin-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminCommunication[];
    },
  });

  const { data: availableRoles = [] } = useQuery({
    queryKey: ['available-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data as Role[];
    },
  });

  const createCommunication = useMutation({
    mutationFn: async (communication: Omit<AdminCommunication, 'id' | 'created_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('admin_communications')
        .insert({
          ...communication,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      
      showModernSuccess(
        'Comunicado criado!',
        'Seu comunicado foi salvo como rascunho com sucesso'
      );
    },
    onError: (error: any) => {
      showModernError(
        'Erro ao criar comunicado',
        error.message || 'Não foi possível criar o comunicado. Tente novamente.'
      );
    },
  });

  const updateCommunication = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminCommunication> & { id: string }) => {
      const { data, error } = await supabase
        .from('admin_communications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      showModernSuccess(
        'Comunicado atualizado!',
        'Suas alterações foram salvas com sucesso'
      );
    },
    onError: (error: any) => {
      showModernError(
        'Erro ao atualizar',
        error.message || 'Não foi possível atualizar o comunicado.'
      );
    },
  });

  const deleteCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      const { error } = await supabase
        .from('admin_communications')
        .delete()
        .eq('id', communicationId);

      if (error) throw error;
      return communicationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      showModernSuccess(
        'Comunicado excluído!',
        'O comunicado foi removido permanentemente'
      );
    },
    onError: (error: any) => {
      showModernError(
        'Erro ao excluir',
        error.message || 'Não foi possível excluir o comunicado.'
      );
    },
  });

  const sendCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      // Atualizar status para 'sending' antes de enviar
      await supabase
        .from('communications')
        .update({ send_status: 'sending' })
        .eq('id', communicationId);

      const { data, error } = await supabase.functions.invoke('send-communication', {
        body: { communicationId },
      });

      if (error) throw error;
      return data;
    },
    onMutate: async (communicationId) => {
      // Mostrar toast de loading
      const loadingId = showModernLoading(
        'Enviando comunicado...',
        'Processando e enviando para todos os destinatários'
      );
      
      return { loadingId };
    },
    onSuccess: (data, variables, context) => {
      // Dismiss loading toast
      if (context?.loadingId) {
        dismissModernToast(context.loadingId);
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      
      const totalRecipients = data?.totalRecipients || 0;
      const emailsSent = data?.emailsSent || 0;
      const notificationsSent = data?.notificationsSent || 0;
      
      showModernSuccess(
        'Comunicado enviado!',
        `Enviado com sucesso para ${totalRecipients} usuários (${emailsSent} emails, ${notificationsSent} notificações)`
      );
    },
    onError: (error: any, variables, context) => {
      // Dismiss loading toast
      if (context?.loadingId) {
        dismissModernToast(context.loadingId);
      }
      
      showModernError(
        'Erro ao enviar comunicado',
        error.message || 'Não foi possível enviar o comunicado. Verifique os logs para mais detalhes.'
      );
    },
  });

  const cancelCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('cancel_communication_sending', {
        p_communication_id: communicationId,
        p_user_id: user.user.id
      });

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      showModernWarning(
        'Envio cancelado',
        'O envio do comunicado foi interrompido. Destinatários restantes não receberão a mensagem.'
      );
    },
    onError: (error: any) => {
      showModernError(
        'Erro ao cancelar',
        error.message || 'Não foi possível cancelar o envio.'
      );
    },
  });

  const getDeliveryStats = async (communicationId: string) => {
    const { data, error } = await supabase
      .from('communication_deliveries')
      .select('delivery_channel, status')
      .eq('communication_id', communicationId);

    if (error) throw error;

    const stats: Record<string, any> = {};
    
    data.forEach((delivery) => {
      const channel = delivery.delivery_channel;
      if (!stats[channel]) {
        stats[channel] = { total: 0, delivered: 0, pending: 0, failed: 0 };
      }
      
      stats[channel].total++;
      if (delivery.status === 'delivered') {
        stats[channel].delivered++;
      } else if (delivery.status === 'pending') {
        stats[channel].pending++;
      } else if (delivery.status === 'failed') {
        stats[channel].failed++;
      }
    });

    return stats;
  };

  return {
    communications,
    isLoading,
    availableRoles,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    sendCommunication,
    cancelCommunication,
    getDeliveryStats,
  };
};
