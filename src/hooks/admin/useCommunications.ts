
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar comunicado: ' + error.message);
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
      toast.success('Comunicado atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar comunicado: ' + error.message);
    },
  });

  const deleteCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      const { error } = await supabase
        .from('admin_communications')
        .delete()
        .eq('id', communicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao deletar comunicado: ' + error.message);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar comunicado: ' + error.message);
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
      toast.success('Envio cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao cancelar: ' + error.message);
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
